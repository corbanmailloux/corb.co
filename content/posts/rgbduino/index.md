---
title: RGBDuino
date: 2012-06-13

description: Bluetooth control of RGB LEDs with Arduino and Android App Inventor
summary: Bluetooth control of RGB LEDs with Arduino and Android App Inventor.

tags:
  - Microcontroller
  - Software Project
  - Home Automation

categories:
  - Projects

aliases:
  - /projects/rgbduino
---

{{< banner color="blue" >}}
**Note from the future:** [RGBDuino](/posts/rgbduino) and [RGBWeb](/posts/rgbweb) are _very_ old and outdated, but they were some of my first publicly-shared projects so I keep them up for historical purposes. They were also my first steps into home automation and IoT devices.
There are now many better ways to build this kind of system, especially if you're trying to use it as part of a larger lighting system. Personally, I love [ESPHome](https://esphome.io/) and use it with [Home Assistant](https://www.home-assistant.io/).
{{< /banner >}}

RGBDuino is a project created to use an Android device and an Arduino to control a string of red-green-blue LEDs over Bluetooth. The project consists of two main parts: the hardware side and the software side.

## Video

First, a demonstration:
{{< youtube wHQVE32OFiM >}}

## Hardware

For the hardware end of things, I used a breadboard-able version of an Arduino. Any Arduino or Arduino clone should work.

{{< figure src="rgbduino-bb.png" alt="Breadboard wiring diagram" >}}

Essentially, the Arduino receives bytes from the Serial Module through digital pin 2 and sends data through digital pin 3. The power N-channel MOSFETS have their gate legs (left legs) connected to PWM pins 9, 10, and 11. Each gate leg is also connected through a resistor to GND. The drain leg (middle leg) is connected to one of the negative returns from the LED strip. The source legs (right leg) are all connected to GND.

The 12 volt power source connects to GND and the common anode on the LED strip.

The parts I used were:

- MOSFETS: ["N-Channel MOSFET 60V 30A" from SparkFun](https://www.sparkfun.com/products/10213)
- Bluetooth Module: "JY-MCU Bluetooth Wireless Serial Port Module for Arduino" from DX (edit: product link removed)
- Arduino: [Arduino Nano](https://www.arduino.cc/en/Main/ArduinoBoardNano) (but any Arduino or clone should work)

## Software

The Android app was written using MIT's App Inventor. The project source and a compiled APK version of the app are [available on {{< fontawesome github >}} GitHub](https://github.com/corbanmailloux/RGBDuino).

The Arduino side of the project uses the [SoftwareSerial library](https://www.arduino.cc/en/Reference/softwareSerial) to listen to the Bluetooth module. This could be done with the built in Serial pins, but that would make it difficult to upload new code while testing. The Arduino code is also [available on {{< fontawesome github >}} GitHub](https://github.com/corbanmailloux/RGBDuino/blob/master/Arduino/RGBDuino.ino).

## Related Projects

Monica Houston built a new project using some elements of this project. You can check it out at [Hackster.io](https://www.hackster.io/monica/rgb-leds-controlled-from-android-app-5ffe2e).

I also built an internet-connected version of this project called [RGBWeb](/posts/rgbweb).
