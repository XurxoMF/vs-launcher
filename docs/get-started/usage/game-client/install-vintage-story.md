---
icon: down-to-line
description: If you don't have the game installed check out this guide.
---

# Install Vintage Story

Installing Vintage Story using VS Launcher is the easies way to do it. It's just a few clicks and play. Let's see how it's done:

## Automatic installation

If you're using VS Launcher if to make things easier so this is the best way to install Vintage Story as it'll do everything automatically.

If with this option the game is not working try installing it manually the first time following the guide below.

{% stepper %}
{% step %}
### Install a Version

The first thing you need is the **Version** so let's intall it:

{% embed url="https://www.youtube.com/watch?v=2ukc1o14Mvw" %}
Install a new Version | VS Launcher Guides
{% endembed %}
{% endstep %}

{% step %}
### Add an Installation

Now that you have the **Version** installed you need to create an **Installation** (data folder) to save the world, configs, maps... so let's create one:

{% embed url="https://www.youtube.com/watch?v=DKix0LOk4Xw" %}
Add a new Installation | VS Launcher Guides
{% endembed %}
{% endstep %}

{% step %}
### Play the game

Now you've added your already installed Vintage Story Version and Installation the only thing that's left is play the game!

First you'll need to select the **Installation** you want to use on the dropdown on the left menu and then press play like in the video:

{% embed url="https://www.youtube.com/watch?v=Y-SIWT6GscQ" %}
Play Vintage Story | VS Launcher Guides
{% endembed %}
{% endstep %}
{% endstepper %}

## Manual installation

The idea is to install Vintage Story using VS Launcher install sections as this will automatically add everything to the launcher settings so you don't have to do the job 2 times.

However, you may want to install it the old way or if you're using Linux you may have to do it this way the first time for the game dependencies to work properly and then add it to VS Launcher. To do so follow the next steps:

### Windows

{% stepper %}
{% step %}
### Download the game

Go to the [Vintage Story Client Area](https://account.vintagestory.at/) and download `.exe` of the version you want.
{% endstep %}

{% step %}
### Install it

Install the downloaded \`.exe\` as any other program choosing the folder where you want to install it.
{% endstep %}

{% step %}
### Add it to VS Launcher

Now you just have to add it to VS Launcher so follow the [Vintage Story is already installed](vintage-story-is-already-installed.md) guide to do so.
{% endstep %}
{% endstepper %}

### Ubuntu and its derivatives

{% stepper %}
{% step %}
### Download the game

Go to the [Vintage Story Client Area](https://account.vintagestory.at/) and download `.tar.gz` of the version you want.

You can also install it using Flatpak or any other package manager where Vintage Story is available. If you do so then go to the step 4 directly.
{% endstep %}

{% step %}
### Extract it

Extract the `.tar.gz` on the folder you want. You should not delete or move this folder later so make sure to place it where it doesn't bother while working or using the file explorer. A good location for it is the `/usr/share/vintagestory` folder.
{% endstep %}

{% step %}
### Add execution perms

If you downloaded it from the Client Area make sure to change the `Vintagestory` executable permissions to allow execution:

```sh
sudo chmod -x ./Vintagestory
```
{% endstep %}

{% step %}
### Add it to VS Launcher

Now you just have to add it to VS Launcher so follow the [Vintage Story is already installed](vintage-story-is-already-installed.md) guide to do so.
{% endstep %}
{% endstepper %}

### Arch and its derivatives

{% stepper %}
{% step %}
### Download the game

Go to the [Vintage Story Client Area](https://account.vintagestory.at/) and download `.tar.gz` of the version you want.

You can also install it using the Arch User Repository (AUR) with the [vintagestory package](https://aur.archlinux.org/packages/vintagestory). For example, using the [yay](https://aur.archlinux.org/packages/yay) AUR helper. If you do so then go to the step 4 directly.

```sh
yay -S vintagestory
```
{% endstep %}

{% step %}
### Extract it

Extract the `.tar.gz` on the folder you want. You should not delete or move this folder later so make sure to place it where it doesn't bother while working or using the file explore. A good location for it is the `/usr/share/vintagestory` folder.
{% endstep %}

{% step %}
### Add execution perms

If you downloaded it from the Client Area make sure to change the `Vintagestory` executable permissions to allow execution:

```sh
sudo chmod -x ./Vintagestory
```
{% endstep %}

{% step %}
### Add it to VS Launcher

Now you just have to add it to VS Launcher so follow the [Vintage Story is already installed](vintage-story-is-already-installed.md) guide to do so.
{% endstep %}
{% endstepper %}
