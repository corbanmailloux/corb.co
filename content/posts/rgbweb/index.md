---
title: RGBWeb
date: 2014-04-26

description: Internet-controllable RGB lighting
summary: Internet-controllable RGB lighting using Arduino.

tags:
  - Microcontroller
  - Software Project
  - Home Automation

categories:
  - Projects

aliases:
  - /projects/rgbweb
---

{{< banner color="blue" >}}
**Note from the future:** [RGBDuino](/posts/rgbduino) and [RGBWeb](/posts/rgbweb) are _very_ old and outdated, but they were some of my first publicly-shared projects so I keep them up for historical purposes. They were also my first steps into home automation and IoT devices.
There are now **many** better ways to build this kind of system, especially if you're trying to use it as part of a larger lighting system. Personally, I love [ESPHome](https://esphome.io/) and use it with [Home Assistant](https://www.home-assistant.io/).
{{< /banner >}}

RGBWeb is an evolution of [RGBDuino](/posts/rgbduino) that removes the Bluetooth requirement by using an internet connection. This does, however require a server to remain running with the Arduino attached. RGBWeb also was built with some new features that RGBDuino never had.

RGBWeb is a project created to use an Android device, an Arduino, and a server to control a string of red-green-blue LEDs over the internet. The project consists of three main parts: the hardware side (Arduino), the server configuration, and the Android software.

## App Screenshot

This is what the app looks like:
{{< figure src="rgbweb-screenshot.png" alt="Screenshot of Android app" width="60%" align=center >}}

## Hardware (Arduino)

The Arduino has very similar wiring to RGBDuino. The only difference is that RGBWeb does not have the Bluetooth module attached. See the [RGBDuino project page](/posts/rgbduino) for an image of the basic configuration.

Essentially, the Arduino receives commands over the USB (serial) connection. The power N-channel MOSFETS have their gate legs (left legs) connected to PWM pins 9, 10, and 11. Each gate leg is also connected through a resistor to GND. While there may be an optimal value for this resistor, I have found that this setup is not picky about resistance. The drain leg (middle leg) is connected to one of the negative returns from the LED strip. The source legs (right leg) are all connected to GND.

The 12 volt power source connects to GND and the common anode on the LED strip.

The parts I used were:

- MOSFETS: ["N-Channel MOSFET 60V 30A" from SparkFun](https://www.sparkfun.com/products/10213)
- Arduino: [Arduino Nano](https://www.arduino.cc/en/Main/ArduinoBoardNano) (but any Arduino or clone should work)

## Server Configuration

The server configuration was the part of this project that gave me the most trouble. At different times, I've had this project running on two different types of servers. It was running on an Apache server running on my main computer, but now it is running on a Windows Server 2012 Datacenter machine that is my general purpose server.

I discovered that the biggest problem was ensuring a basic server was established and that the server was properly configured to run PHP.

I chose to write the server web pages in PHP because I know that it can handle serial communications from the server to a locally attached device (specifically, an Arduino). Reading from a serial port is not, at the time of writing, possible on Windows, but that's okay for our purposes. It would be nice for future updates to be able to get a response from the Arduino, though.

I made two separate web pages in PHP to interact with the Arduino. One is only there to allow quick lighting control from any internet connected device from inside a web browser. All that web page does is display a text box to allow input of a HEX value of a color to display. I also added a JavaScript element called [JSColor](http://jscolor.com/) to allow more elegant color choosing. It uses PHP GET requests to execute commands. I didn't want to use POST for this because I want to be able to simply enter a URL and have it change the lights without clicking or adjusting anything.

For example, this would set the lights on to white at full brightness:

```plaintext
http://www.example.com/index.php?RGBColor=FFFFFF
```

The other web page is not much of a page at all; it's a custom API and is only intended to be accessed by the Android app. It uses PHP POST requests sent by the Android app to execute commands. This is the page that handles more complex features, such as password protection (very basic and unencrypted) and other custom commands like fading.

The actual PHP files, in the correct folder structure, are on Github (see link below).

The basic setup of the server is this:

1. Set up any server system that allows PHP.
1. Connect the Arduino (wiring is linked above) via USB to the computer that is running the server.
1. Open the Arduino software and program the Arduino with the code provided and note the COM port that the Arduino is on.
1. Update the PHP code to reference the correct COM port and to use a password of your choosing.
1. Run the server.

## Software

The Android app was written using MIT's App Inventor and the Arduino code uses only standard Arduino libraries. The project source code and a compiled APK version of the app are [available on {{< fontawesome github >}} GitHub](https://github.com/corbanmailloux/RGBWeb).
