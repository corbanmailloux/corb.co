---
title: "Pedestrian Crossing Light as Parking Sensor"
date: 2024-03-12T00:00:00-05:00

description: "Repurposing a pedestrian crossing light as a garage parking system using ESPHome"
summary: "Repurposing a pedestrian crossing light as a garage parking system using ESPHome"

showtoc: false

tags:
  - Home Automation

categories:
  - Projects
---

Have you ever struggled to park perfectly in your garage? Sure, you could hang a tennis ball on a string, but where's the fun in that? Ever since I was a kid, I've dreamed of having a traffic light in my house. Now that my wife and I are renovating our home, I finally had the chance to make this dream a reality—with a slight modification. While a full traffic light might not fit with our home's aesthetic (according to my wife), I found the perfect alternative:

**A pedestrian crossing light for our garage!**

## The Light

{{< figure src="sign-example.jpg"
alt="Pedestrian crossing light showing a walk signal and the number 42."
align=center
width="100%" >}}

Turns out you can find anything on eBay, including a [pedestrian crossing signal](https://www.ebay.com/itm/125992762337) for just $40. This particular model was perfect because it had everything I was looking for:

1. Hand and walk icons in the classic style I wanted (different models have varying designs)
2. A 2-digit, 7-segment number display for distance readings
3. Cheap enough that I can break it and not feel bad

The sign runs on 120V AC out of the box, making it easy to work with.

## Hardware Modifications

The first challenge was getting inside the weatherproof housing. These signs are built to withstand the elements, so it took some work with a Dremel and several cut-off disks to carefully cut through the plastic shell. (Pro tip: wear eye protection for this part! 🕶️)

<small>(Note that if you only wanted to control the hand and walk lights, that could be done with just a relay board without opening the housing.)</small>

Inside, I discovered the sign was divided into two separate systems:

1. The hand/walk signals
2. The countdown timer display

The hand/walk system turned out to be surprisingly straightforward: it just needed ~12V DC applied to different sets of pins to control each signal. I was impressed to find that the system was designed with a fail-safe mechanism—if you try to activate both signals simultaneously, it defaults to showing the "stop" hand.

The numerical displays required a different approach. While I _could_ have designed a control board for the existing LED setup, it would have required either:

- A large number of GPIO pins (one for each segment)
- A 7-segment driver circuit (which would struggle with the high power requirements of these large displays)

Instead, I opted for a more DIY solution: replacing the original LEDs with addressable RGB LED strips. By carefully cutting and chaining the strips to follow the segment patterns, I created a fully software-controllable display that offered bonus features like color control and effects.

{{< figure src="number-displays-raw.jpg"
alt="RGB strips cut and arranged in the pattern of two 7-segment displays"
align=center
width="100%"
caption="I didn't think to paint the backing board black until _after_ mounting these strips...">}}

## Making it Smart: Control System

For the brains of the operation, I chose an ESP32 coupled with some basic MOSFETs to handle the power switching for the walk/hand signals. I soldered these components to a piece of perfboard and managed to fit it in some empty space within the housing.

{{< figure src="finished-internals.jpeg"
alt="Internals of a pedestrian crossing light, with additional wires and a microcontroller wedges into the extra space."
align=center
width="100%" >}}

On the software side, I went with [ESPHome](https://www.esphome.io/), an excellent firmware framework that integrates seamlessly with Home Assistant.

Using ESPHome's [light partition](https://www.esphome.io/components/light/partition.html) feature, I split the single addressable LED strip into a virtual `light` for each of the 14 segments, plus a `light` for each of the hand and walk signals.

```yaml
light:
  # One light strip snakes around the unit, covering both number displays.
  # See the `partition` entries below for breaking up the strip into segments.
  - platform: esp32_rmt_led_strip
    rgb_order: GRB
    pin: 22
    num_leds: 87
    rmt_channel: 0
    chipset: WS2812
    id: digit_display_light
    internal: true

  - platform: partition
    name: Digit 1 Segment 1
    id: dig_1_seg_1
    internal: true
    segments:
      - id: digit_display_light
        from: 77
        to: 79
  - platform: partition
    name: Digit 1 Segment 2
    id: dig_1_seg_2
    internal: true
    segments:
      - id: digit_display_light
        from: 69
        to: 73

  # Continued for 14 segments...
```

To make controlling the numbers from Home Assistant more practical, I also added a `number` component to the ESPHome configuration. I'd recommend reading the actual code/config for that [here](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/garage_parking_sign.yaml#L392), but it takes a number -9 through 99 and figures out which segments to turn on.

In Home Assistant, there is now a simple number input that I can set to any valid number to update the display.

{{< figure src="hass-device-card.png"
alt="Cropped screenshot of a number entry box and two switches in Home Assistant."
align=center
width="100%" >}}

## Making it Useful: Parking Distance Sensing

With a fully controllable display on the wall, it was time to make it actually useful as a parking aid.

The classic way to do distance measurement with a microcontroller is using very cheap ultrasonic sensors like the ubiquitous [HC-SR04](https://www.sparkfun.com/ultrasonic-distance-sensor-hc-sr04.html). I went with a slightly upgraded and waterproof version: the [JSN-SR04T Waterproof Ultrasonic Sensor](https://components101.com/sensors/jsnsr04t-waterproof-ultrasonic-sensor-pinout-datasheet-working-application-alternative).
This is a nice alternative for a few reasons:

- Longer sensing range
- Waterproof/protected sensor (nice for a garage that I also use as a workshop)
- Compatible with the same ultrasonic libraries that work for the SR04
- Comes with long connection wires that makes mounting in the garage easier

I mounted the sensors on the garage wall, carefully aligned with each car's bumper. After some calibration to determine the ideal parking position, the system provides real-time distance measurements through Home Assistant.

With some more ESPHome configuration and lambdas, changes to the distance will update the hand/walk signal and the number display.

```yaml
sensor:
  - platform: ultrasonic
    name: "Range Sensor - Left"
    unit_of_measurement: "inches"
    # ...
    on_value:
      then:
        # Display the distance the car has to move. If it's an invalid reading, blank the display.
        - number.set:
            id: display_number
            value: !lambda >-
              if (isnan(x)) {
                return -10;
              }
              int display_value = max( -9, min( (int)(round(x) - id(target_distance_left).state), 99 ));

              if (display_value >= 20) {
                // Distances over 20 are noisy. Just display "--"
                return -11;
              }

              return display_value;
        # Update the hand/walk signals accordingly. If the car is less than 3 inches from the target, display the hand. Otherwise, display the walk.
        - lambda: |-
            if (isnan(x)) {
              id(light_hand).turn_off().perform();
              id(light_walk).turn_off().perform();
            } else if ((x - id(target_distance_left).state) < 3) {
              id(light_hand).turn_on().perform();
              id(light_walk).turn_off().perform();
            } else {
              id(light_hand).turn_off().perform();
              id(light_walk).turn_on().perform();
            }
```

To make the system completely integrated, I added Home Assistant automations that automatically activate the correct parking sensor when a garage door opens.
This creates a seamless experience where opening the garage door with the remote is the only action needed. Everything else happens automatically.

## Live Demo!

Putting it all together, here's the experience of driving into my garage:
{{< youtube PZU5H5tdLbM >}}

## Code and Resource Links

While I imagine each type of pedestrian signal is unique, this project should be repeatable with some basic tools and hardware. I used the following:

### Parts

- Pedestrian Crossing Signal with Countdown Display: [eBay listing](https://www.ebay.com/itm/125992762337), [Manufacturer page with datasheet](https://www.eoi.com.tw/Product/Product_Detial_TS?product_id=2268)
- ESP32: [ESP32 D1 Mini on AliExpress](https://www.aliexpress.us/item/3256804611055118.html)
- WS2815 12VDC Individually-Addressable RGB LED Strip: [BTFLighting on AliExpress](https://www.aliexpress.us/item/2251832774866810.html)
- Miscellaneous 12+V DC MOSFETs for controlling the hand/walk LEDs
- 12V DC Power Supply
- JSN SR-04T Waterproof Ultrasonic Sensors: Available on Amazon/AliExpress/etc. [Datasheet](https://rjrorwxhjiilll5q.ldycdn.com/JSN-SR04T-3.0-aidnqBpoKliRljSlqnqkilqj.pdf)

### Code

- [ESPHome config](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/garage_parking_sign.yaml)
- [Home Assistant package with automations](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/packages/garage_parking_sign.yaml)
