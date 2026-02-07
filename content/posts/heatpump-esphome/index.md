---
title: "Replacing Mitsubishi's Kumo Cloud with Local ESPHome Control"
date: 2025-05-04

description: "Removing unreliable cloud dependencies AND improving functionality!"
summary: "Removing unreliable cloud dependencies AND improving functionality!"

cover:
  image: "box-with-adapter.webp"

showtoc: false

tags:
  - Home Automation

categories:
  - Projects
---

## Background (Or, Why Cloud-Based Integrations Are Unreliable)

In our house, we have Mitsubishi Hyper Heat heat pumps for central heating and cooling. The system has worked well since we installed it, but integrating it with Home Assistant required the use of a [custom, cloud-based integration](https://github.com/dlarrick/hass-kumo) through Mitsubishi's Kumo Cloud system. I am very thankful to developers like [{{< fontawesome github >}} dlarrick](https://github.com/dlarrick) for reverse-engineering and implementing this integration, but I would still prefer a local-only system for something as central as my HVAC system.

Then, in March 2025, Mitsubishi released a new app that [broke the existing integration](https://github.com/dlarrick/hass-kumo/issues/189) (and didn't seem to improve the cloud reliability). This was the push I needed to figure out an alternative solution.

## ESPHome to the Rescue

I have a lot of ESPHome devices [scattered around my house](https://github.com/corbanmailloux/home-assistant-configuration/tree/master/esphome), so it only made sense to integrate the HVAC with ESPHome. Fortunately, others are working on [integrating Mitsubishi's UART protocol with ESPHome natively](https://github.com/esphome/esphome/pull/7289). In the meantime, there is a custom component available for ESPHome that works very well: https://muart-group.github.io/user

This component connects to the HVAC system using the CN105 port used for the Kumo Cloud adapter and/or external thermostats.

For my use case, I need to be able to connect **both** a Mitsubishi thermostat and this ESPHome adapter, so this prebuilt [ESP32 board on Etsy](https://www.etsy.com/listing/1762258422/mahtanar-heat-pump-controller) was perfect. It has a passthrough port to allow connecting the MHK2 thermostat base station.
Unfortunately, it's out of stock at the time of writing, but the shop owner claims they are "expecting new boards probably mid-May-ish depending on scheduling and world-trade."

The documentation and ESPHome configuration for the boards are here: https://github.com/tinwer-group/mahtanar

{{< figure src="bare-board.webp" alt="Image of bare circuit board of the adapter" width=80% align=center >}}

## Packaging and Installing

The product above is just a bare board, so I needed an enclosure to protect it when mounted to my indoor HVAC units.
I made a quick 3D model to have a properly fitting case. The model is [available on Thingiverse](https://www.thingiverse.com/thing:7012310).

{{< figure src="box-with-adapter.webp" alt="3D printed enclosure with board installed" width=80% align=center >}}

With that done, it's as simple as unplugging the old Kumo Cloud adapter and plugging this ESPHome adapter in its place!

{{< figure src="adapter-installed.webp" alt="Side of an HVAC air handler with the new enclosure mounted" width=60% align=center caption="The lower box is the new adapter and the upper box is the base station for the MHK2 thermostat." >}}

## Usage in Home Assistant

Setting up the device is the same as any other ESPHome device, and you can follow the board creator's instructions [here](https://github.com/tinwer-group/mahtanar?tab=readme-ov-file#setup).

In Home Assistant, this setup exposes a fully functional `climate` entity, plus [several additional sensors and configurations](https://muart-group.github.io/user/entities). For example, mine exposes useful details like filter status, outdoor temperature, and compressor frequency.

As a little bonus, I also created a climate group using the custom [climate group component](https://github.com/bjrnptrsn/climate_group). This allows me to control both of the HVAC zones in my house with a single virtual thermostat. That group thermostat is then exposed to HomeKit and available on my central wall display.
