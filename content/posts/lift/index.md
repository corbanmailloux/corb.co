---
title: "Did You Lift Today?"
date: 2014-11-18

description: Tracking the "only" important statistic
summary: Daily check-in workout tracker for beefcakes.

cover:
  image: lift.svg

tags:
  - Software Project

categories:
  - Projects

aliases:
  - /projects/lift
---

{{< figure src="lift.svg" alt="Bicep curl icon" width=40% align=center >}}

From the description of the app on the [Google Play Store](https://play.google.com/store/apps/details?id=co.corb.dylt):

> Do you lift?
>
> Do you wish people asked you if you lift, just so you can say that you do?
>
> Well now you can have your phone or tablet ask you, giving you that positive, self-righteous feeling as often as you want. When you admit that you haven't actually lifted today, the app will help you find a nearby gym.
>
> **No excuses; lift like a champion.**

Did You Lift Today? started as a joke Android app when my body-building friend Jake and I had a conversation that went something like this:

- _Me:_ Ooh. Google Fit was just released. That's cool.
- _Jake:_ I don't understand all of these fitness trackers. I think there should be an app that just asks you if you lifted. That's all that's important anyways.
- _Jake leaves to go to the gym._

By the time Jake got back, I had developed an app using [Tasker's App Factory](https://play.google.com/store/apps/details?id=net.dinglisch.android.appfactory) that did just that. After a few people in my office saw it, it became a running joke/useful tool.

I then developed a real Android app of it, [available on the Google Play Store](https://play.google.com/store/apps/details?id=co.corb.dylt), which went on to get some [amazing reviews](https://play.google.com/store/apps/details?id=co.corb.dylt&showAllReviews=true).

After an iPhone-using coworker complained that it wasn't compatible with iOS, I built a [web version at lift.corb.co](http://lift.corb.co) that uses localStorage to track your lifts.

The [Android app code](https://github.com/corbanmailloux/Lift/tree/master) and the [website code](https://github.com/corbanmailloux/Lift/tree/gh-pages) are both available on branches on [{{< fontawesome github >}} GitHub](https://github.com/corbanmailloux/Lift).
