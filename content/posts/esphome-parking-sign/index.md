---
title: "ESPHome Parking Sensor and Pedestrian Sign"
date: 2024-03-12T00:00:00-05:00

description: "Repurposing a pedestrian crossing sign as a garage parking system."
summary: "Repurposing a pedestrian crossing sign as a garage parking system."

showtoc: true

tags:
  - Home Automation

categories:
  - Projects

draft: true
---

Ever since I was a kid, I've always wanted to put up a traffic light somewhere in my house. Now that my wife and I are renovating our own home, I finally get the chance to make these dreams a reality. Recently I finally realized that it's hard to make a traffic light fit in with classy decor (or at least that's what my wife says), so the dreams have been modified.

**Let's put a pedestrian crossing sign in my garage!**

## The Sign

### TODO: Image of installed product

Turns out you can buy anything on EBay, so I found a [pedestrian crossing sign](https://www.ebay.com/itm/125992762337) for about $40 total. It runs on 120v AC and has all the features I was looking for:

1. Hand and walk icons that are the right shape (there are different styles in different models, but these are the ones I'm used to.)
2. 2-digit, 7-segment number display
3. Cheap enough that I can break it and not feel bad.

It was a pain to open up because it's sealed and weatherproof, but I was able to cut through the plastic shell with a Dremel and several cut-off disks. Definitely wear eye protection for this part.

Inside, I found that the sign was split into two distinct systems: the hand/walk part, and the countdown timer. The hand/walk part was easy enough to tap into: simply apply ~12V DC to one set of pins for the hand signal and another set of pins for the walk signal. I thought it was interesting that the system is fail-safe, so the circuit automatically puts the hand back up if you try to turn on both at once.

For the numerical displays, I decided to be a bit more destructive. I _could_ have soldered up a control board for the existing LED arrangement, but it would either require a large number of GPIO pins or a 7-segment driver circuit. Most of the driver chips I could find wouldn't work with the high power draw of a sign this large, so I ultimately just replaced the LEDs with my own.
I used a strip of addressable RGB LEDs, cut and chained to cover all segments. This allows the segment control to be fully done in software and gives some extra features like color control and effects.

{{< figure src="number-displays-raw.jpg"
alt="RGB strips cut and arranged in the pattern of two 7-segment displays"
align=center
height=500
caption="I didn't think to paint the backing board black until _after_ mounting these strips...">}}

### Control Hardware and Software

I went with an ESP32 to control the sign with some basic MOSFETs for switching the walk/hand load. The circuit is pretty simple:

#### TODO: Schematic

For the software, I'm using [ESPHome](https://www.esphome.io/) because it integrates easily into Home Assistant.
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

To make controlling the numbers from Home Assistant more practical, I also added a `number` component to the ESPHome configuration. I'd recommend reading the actual code/config for that [here](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/garage_parking_sign.yaml#L343), but it takes a number -9 through 99 and figures out which segments to turn on.

In Home Assistant, there is now a simple number input that I can set to any valid number to update the display.

{{< figure src="hass-device-card.png"
alt="Cropped screenshot of a number entry box and two switches in Home Assistant."
align=center
height=500 >}}

{{< figure src="sign-example.jpg"
alt="Cropped screenshot of a number entry box and two switches in Home Assistant."
align=center
height=500 >}}

## Making it Useful: Laser Time-of-Flight Parking Sensor

Okay, so now I have a controllable sign on the wall, but let's put it to use as a parking sensor.

Yes, I could go old-school and just hang a tennis ball on a string to park in the right spot, but that doesn't use lasers and the speed of light.

For this purpose, I built a separate ESPHome device using an ESP8266 and a [VL53L1X (datasheet)](https://www.st.com/resource/en/datasheet/vl53l1x.pdf) laser time-of-flight (ToF) sensor. By bouncing lasers off of my car and timing how long the laser takes to return to the sensor, we can calculate how far away the car is.

I 3D printed a basic enclosure for this sensor and mounted it on my garage wall directly in line with the car's bumper. After I calibrated it to work for the ideal garage parking spot, I had a standard Home Assistant sensor that indicated how far the car had to move to be in the ideal spot.

With some more ESPHome configuration and lambdas, changes to the distance will update the hand/walk signal and the number display.

```yaml
sensor:
  - platform: homeassistant
    name: "Remote Range Sensor - Right"
    entity_id: sensor.garage_parking_sensor_right_distance
    on_value:
      then:
        # Display the distance the car has to move. If it's an invalid reading, blank the display.
        - number.set:
            id: display_number
            value: !lambda >-
              if (isnan(x)) {
                return -10;
              }
              if (id(range_status_right).state != 0) {
                return -11;
              }

              return max( -9, min( (int)(round(x) - id(target_distance_right).state), 99 ));
        # Update the hand/walk signals accordingly. If the car is less than 3 inches from the target, display the hand. Otherwise, display the walk.
        - lambda: |-
            if (isnan(x)) {
              id(light_hand).turn_off().perform();
              id(light_walk).turn_off().perform();
            } else if (id(range_status_right).state != 0) {
              id(light_hand).turn_off().perform();
              id(light_walk).turn_on().perform();
            } else if ((x - id(target_distance_right).state) < 3) {
              id(light_hand).turn_on().perform();
              id(light_walk).turn_off().perform();
            } else {
              id(light_hand).turn_off().perform();
              id(light_walk).turn_on().perform();
            }
```

Finally, using Home Assistant automations, turn on the parking sensor when the garage door opens and automatically turn it off after 5 minutes. This enables a fully automatic parking flow using only the garage door opener remote.

## Live Demo!

Putting it all together, here's the experience of driving into my garage:

#### TODO: Video

## Code and Resource Links

While I imagine each type of pedestrian sign is unique, this project should be repeatable with some basic tools and hardware. I used the following:

### Parts

#### Sign

- Pedestrian Crossing Sign with Countdown Display: [eBay listing](https://www.ebay.com/itm/125992762337), [Manufacturer page with datasheet](https://www.eoi.com.tw/Product/Product_Detial_TS?product_id=2268)
- ESP32: [ESP32 D1 Mini on AliExpress](https://www.aliexpress.us/item/3256804611055118.html)
- WS2815 12VDC Individually-Addressable RGB LED Strip: [BTFLighting on AliExpress](https://www.aliexpress.us/item/2251832774866810.html)
- Miscellaneous 12+V DC MOSFETs for controlling the hand/walk LEDs
- 12V DC Power Supply

#### Sensors

- ESP8266 (or ESP32): I use [cheap D1 Mini boards like this one](https://www.aliexpress.us/item/2251832488149071.html) for projects like this.
- VL53L1X Laser ToF Sensor: Note that there are different models with different ranges. I ordered the VL53L1X model from [here on AliExpress](https://www.aliexpress.us/item/3256802905626316.html).
  - [Datasheet from the manufacturer](https://www.st.com/resource/en/datasheet/vl53l1x.pdf)

### Code

- [ESPHome config for the sign](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/garage_parking_sign.yaml)
- ESPHome config for a sensor: [Base template](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/common/garage_parking_sensor_base.yaml), [Device config](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/garage_parking_sensor_right.yaml), [Custom ESPHome library for using the VL53L1X sensor (which I've slightly modified in my version)](https://github.com/mrtoy-me/esphome-my-components/tree/main/components/vl53l1x)
- [Home Assistant package with automations](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/packages/garage_parking_sign.yaml)
