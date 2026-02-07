---
title: "Outlet Power Sensor"
date: 2022-01-16

description: "A renter-friendly system to create smart switches out of switched outlets."
summary: "A renter-friendly system to create smart switches out of switched outlets."

showtoc: false

tags:
  - Home Automation

categories:
  - Projects

draft: true
---

## The Problem

I've lived in several apartments where the wall switch controls a single socket of one outlet. The expectation is that you would plug a floor lamp into that outlet and use the wall switch to control it, but I like to have all of my lighting integrated into my home automation system. That leaves a couple options:

- Replace the switch with a smart switch. This is the best answer and the one I would do, but I can't modify the wiring in an apartment so that's a non-starter.
- Leave the switch in the "on" position at all times and put a smart bulb in the lamp. This would allow automated control of the light, but the switch is useless. Additionally, if someone accidentally turns off the switch, the light can no longer be controlled. This isn't ideal, but it is a [common compromise people make when installing smart light bulbs](https://www.howtogeek.com/357476/install-light-switch-guards-to-keep-people-from-turning-off-your-smart-bulbs/).

**Neither answer is perfect for me, so I came up with a new idea.**

## The Solution

What if I could just plug in a device to the outlet that would detect if the switch was on or off? Functionally that would be identical to installing a smart switch, but it could be installed and removed in seconds by just unplugging it.

Enter the "outlet power sensor" (better name pending. [Suggestions?](mailto:outlet-power-sensor@corb.co))

{{< figure src="outlet-power-sensor.jpg" title="Initial Prototype Sensor" alt="Prototype sensor" width="90%" align=center >}}

The sensor has two separate plugs on it that must both be plugged in. One is constant power to run the device, and the other is the sensor plug. When the sensor plug is connected to power, a `binary_sensor` in Home Assistant will be activated instantly.

By simply plugging these two plugs into the switched and unswitched sockets of an outlet, you can instantly convert a wall switch into a smart switch.

This version also has two _output_ sockets. One is connected to constant power to allow you to still use the outlet even though this device takes up both sockets. The other output is connected to a relay and exposed in Home Assistant as a separate `switch` component, allowing independent control of additional devices.
If you don't need any outputs, the wiring can be simplified.

## Real-World Usage

So it's a cool device, but what does it actually do? Here's an example of how I use them.

In my bedroom, there is a wall switch next to the door. That switch normally controls an outlet in a pretty inconvenient location, not at all where I wanted to put the main light for the room. We put a floor lamp with a smart bulb in our ideal placement spot and set up control of the light with remotes on our bedside tables. That left only voice control to turn on the light when you enter the room and a useless switch on the wall, confusing guests and lowering the family approval factor.

I plugged in an outlet power sensor to the switched outlet and wrote a [very simple automation](#automation) so toggling the wall switch toggles the lamp. This is now the best of all options: I can control the light from the wall switch, automations, bedside remotes, phones, and voice control, all without modifying any wiring.

## I'm sold. How do I build one?

{{< banner >}}
**Caution!** This project involves working with high-voltage wall power and wiring connections in a somewhat unexpected way. Wall power is dangerous, and I'm not responsible if you copy this project and something goes wrong. _Please_ be very careful, check all of your connections, and make sure you understand the risks before proceeding.
{{< /banner >}}

I had this idea a few years back and was surprised there wasn't a product on the market for it. It seems the apartment-dwelling home automation market is still small. I've built a few versions over time — including a clever setup that involved disassembling an LED nightlight — but ultimately didn't feel like the projects were safe enough to share with other people.

Then I realized I could build one out of a [Shelly](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/). If you're unfamiliar, it's a $10 WiFi relay intended to be mounted behind an existing switch to convert a standard switch into a smart switch. Sounds very similar to what we're doing!
The Shelly already provides the high-voltage connections we need safely, and it's a trusted, UL-listed device. It's definitely a step up from hacking up a nightlight.

### Parts List

- 1 × [Shelly 1](https://shop.shelly.cloud/shelly-1-wifi-smart-home-automation#50) - about $10
- 2 × basic indoor extension cords like [this one](https://www.homedepot.com/p/HDX-6-ft-16-2-Indoor-Cube-Tap-Extension-Cord-White-HD-145-017/100672781) - about $3
  - Any basic extension cords will work. You'll be cutting them down to your preferred length, so shorter is better.
  - If you'd like to use a grounded version like [this one](https://www.homedepot.com/p/HDX-8-ft-16-3-Indoor-Extension-Cord-SPT21638WH/304159859), you'll have to identify and connect all of the ground wires together as well.
- 2 × wire nuts or [WAGOs](https://www.amazon.com/WAGO-221-412-VE00-2500-221-Conductor/dp/B073486KNT) - basically free (buy a mixed pack and keep them on hand)

### Wiring Diagram

#### TODO: Add wiring diagram

## Software - ESPHome

While the Shelly comes with [very decent software](https://us.shelly.com/blogs/documentation/shelly-1/) that even includes the ability to run the device in a fully-local setup, I prefer to use [ESPHome](https://esphome.io/) on my devices. ESPHome is an excellent open-source project that allows YAML configuration of devices and very clean integration with Home Assistant.

I won't go into detail about how to flash ESPHome onto a Shelly, but there are a few options. I used a cheap FTDI USB to TTL serial adapter and connected directly to the device. The [Tasmota](https://tasmota.github.io/docs/devices/Shelly-1/) and [ESPHome](https://esphome.io/guides/getting_started_hassio.html) docs will be helpful for that type of install.
I recently [came across a way to flash the Shelly over-the-air from the stock firmware](https://savjee.be/2020/09/shelly-2.5-flash-esphome-over-the-air/), but I haven't tested this process myself.

The configuration I use for ESPHome is [available here](https://github.com/corbanmailloux/home-assistant-configuration/blob/master/esphome/archive/office_switch_shelly.yaml), but it's pretty simple.

First is the boilerplate stuff:

```yaml
esphome:
  name: bedroom_outlet_sensor

esp8266:
  board: esp01_1m

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

logger:
api:
ota:
```

Note that the `wifi` settings use `!secrets`. [This feature](https://esphome.io/guides/yaml/#secrets-and-the-secretsyaml-file) allows you to extract private information from the YAML configurations.

Then we get into the slightly more interesting stuff: inputs and outputs.

```yaml
binary_sensor:
  - platform: gpio
    pin:
      number: GPIO5
    name: "Bedroom Outlet Sensor"
    device_class: power

switch:
  - platform: gpio
    pin: GPIO4
    name: "Bedroom Outlet Output"
```

That's the entire configuration. It just sets up a `binary_sensor` representing the wall switch state and a `switch` component for the switched output.

## Configuration in Home Assistant

Using ESPHome has another benefit: autodiscovery in Home Assistant. If you flash the new configuration to your Shelly, Home Assistant should prompt you to configure the device automatically.

After it's set up, you should have a new entry in the "Configuration -> Devices" menu of Home Assistant:

{{< figure src="esphome-device-in-home-assistant.jpg" alt="Screenshot of Home Assistant integration" width="70%" align=center >}}
At this point, you can flip the switch on the wall and you should see the outlet sensor entity change state. That means we're almost done.

### Automation

We've made it to the last step: tying it all together.

How you proceed here will depend on what you want the wall switch to do when you flip it. Now that it's just a `binary_sensor` in Home Assistant, anything is possible. I have it simply toggle the smart light in a lamp in the same room, but you could have it lock all the smart locks, turn the lights red, and play a lullaby on your speakers. These are the benefits of integrating everything into one central hub.

For a simple example, here's an automation that just toggles a `light`:

```yaml
automation:
  - alias: Bedroom Light Switch - Toggle Lamp
    trigger:
      - platform: state
        entity_id: binary_sensor.bedroom_outlet_sensor
        from: "off"
        to: "on"
      - platform: state
        entity_id: binary_sensor.bedroom_outlet_sensor
        from: "on"
        to: "off"
    action:
      - choose:
          # Off, turn on full brightness.
          - conditions:
              - condition: state
                entity_id: light.bedroom_lamp
                state: "off"
            sequence:
              - service: light.turn_on
                entity_id: light.bedroom_lamp
                data:
                  # Always set it to full brightness when turning on.
                  brightness: 255
          # On, turn off.
          - conditions:
              - condition: state
                entity_id: light.bedroom_lamp
                state: "on"
            sequence:
              - service: light.turn_off
                entity_id: light.bedroom_lamp
```

## Wrapping Up

I've been using two of these simple devices in my apartment for about 6 months now and I'm amazed by how good the experience is. As a renter, replacing fixtures and switches is out of the question, but these sensors give the full smart switch experience with no permanent modifications. They also improve the overall user experience because they use an existing, well-known setup that guests don't have to understand to use. To everyone other than me, the switch just controls the light, and that's all they have to know. Finally, by decoupling the light switch from the light itself, I can configure multiple inputs and multiple outputs. I can turn the light on with the light switch, have it dim automatically when we watch a movie, and turn it off from my bedside button as part of my nighttime routine.

Good home automation is all about improving the experience without getting in the way; this project has fulfilled both of those goals.
