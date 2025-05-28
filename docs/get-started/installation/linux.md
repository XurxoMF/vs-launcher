---
icon: linux
description: If you're using Linux follow this guide!
---

# Linux

VS Launcher works on ANY Linux distro thanks to the AppImage compilation we're using.

Installing it on Linux is as easy as downloading the AppImage and double clicking it.... that's it. Let's get started:

{% stepper %}
{% step %}
#### Go to the [GitHub Releases Page](https://github.com/XurxoMF/vs-launcher/releases)

On that page you'll see all the available versions to download.
{% endstep %}

{% step %}
#### Download the Linux version

On the releases page, the first version is always the latest one. There you'll see a table with the different files to download. Just click on the Linux build as shown in the next image:

<div align="left"><img src="../../.gitbook/assets/imagen (1).png" alt=""></div>

{% hint style="warning" %}
`Flatpak` option is NOT packaged with .NET so if you're using an immutable distro Vintage Story will not work!

I'm trying to add .NET to the `.flatpak` but idk if I'll be able to.
{% endhint %}

{% hint style="info" %}
If you want you can use the `DEB` or `Flatpak` options but remember that those option have no automatic updates.

If you use any of this option just install it with double click or `flatpak install vs-launcher-X.X.X.flatpak` and then skip steps 3, 4 and 5. Just open it like any other app.
{% endhint %}

{% hint style="info" %}
`Flatpak` will have automatic updates using Flathub bot for now on it'll need manual updates when a new version is released.
{% endhint %}
{% endstep %}

{% step %}
#### Move the AppImage to an accesible location

For example the Desktop, the you'll be able to open it whenever you want.

{% hint style="warning" %}
Some users reported that AppImage Launcher is breaking automaitc updates so if you want to use it make sure to download the latest VS Launcher version when it's published!
{% endhint %}
{% endstep %}

{% step %}
#### Add execution persmissions

This should be done by default by sometimes you've to manually do it.

```sh
chmod +x ./vs-launcher-X.X.X.AppImage
```
{% endstep %}

{% step %}
#### Open VS Launcher

Double click the VS Launcher AppImage and that's it, ready to use!
{% endstep %}

{% step %}
#### Install Dependencies

VS Launcher does not need any dependecy to work but Vintage Story does so follow the next steps.
{% endstep %}
{% endstepper %}

***

## Vintage Story Dependencies

VS Launcher does not need any dependencies to work, but Vintage Story does. I wanted to make this process automatic upon game launch but Linux has a lot of distros and I can't personalize it to work on all of them so you'll have to do it manually.

To help you with this process we've made a few guide explaining how to install every dependency needed on the most popular Linux distros.

### Debian, Ubuntu and their derivatives

{% stepper %}
{% step %}
### Install .NET 7

```sh
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
```

```sh
chmod +x ./dotnet-install.sh
```

```sh
sudo ./dotnet-install.sh --channel 7.0 --install-dir /usr/lib/dotnet
```
{% endstep %}

{% step %}
### Install your graphics driver

You'll have to look up how to do this for your graphics card and your Linux distribution as the combinations are almost endless!
{% endstep %}

{% step %}
### Install OpenAL and mono-complete

```sh
sudo apt install libopenal-dev mono-complete
```
{% endstep %}

{% step %}
### Fix RAM limits

```sh
sudo sysctl -w vm.max_map_count=262144
```
{% endstep %}
{% endstepper %}

### Arch and its derivatives

{% stepper %}
{% step %}
### Install your graphics driver

You'll have to look up how to do this for your graphics card and your Linux distribution as the combinations are almost endless!
{% endstep %}

{% step %}
### Install all the dependencies

```sh
sudo pacman -S dotnet-runtime-7.0 glibc openal opengl-driver mono
```
{% endstep %}
{% endstepper %}

### SteamOS

{% stepper %}
{% step %}
### Disable readonly mode

SteamOS is protected so you can't make changes by accident. To install the dependencies you need to disable this:

```sh
sudo steamos-readonly disable
```
{% endstep %}

{% step %}
### Configure pacman

Sometimes you'll need to do some steps to configure everything:

```sh
sudo pacman-key --init
sudo pacman-key --populate archlinux
sudo pacman-key --populate holo
```
{% endstep %}

{% step %}
### Install all the dependencies

```sh
sudo pacman -S dotnet-runtime-7.0 glibc openal opengl-driver mono
```
{% endstep %}

{% step %}
### Enable readonly mode again

```sh
sudo steamos-readonly enable
```
{% endstep %}
{% endstepper %}

{% hint style="info" %}
This SteamOS guide was sent by an user that got it working with this. I don't know what each stem does and didn't tested it.
{% endhint %}

***

## Migrating from AppImage to Flatpak

**AppImage** and **DEB** options will use `/home/username/.config` as folder to store configs, game versions, installations... but Flatpak will use `/home/username/.var/app/xyz.xurxomf.vslauncher/config` for this so, if you were using **AppImage** or **DEB** builds of VS Launcher before and you install the **Flatpak** one you'll loose all your configs.

To restore the config you've to move the config file to the new location manually.

{% stepper %}
{% step %}
### Find the old config file

This one will be at `/home/username/.config/VSLauncher/config.json` and copy it or move it to a save location.
{% endstep %}

{% step %}
### Open the Flatpak installed VS Launcher

Open the VS Launcher copy you've installed using Flatpak and wait one or two seconds for it to generate the config file.
{% endstep %}

{% step %}
### Go to the new config file location

This one should be at `/home/username/.var/app/xyz.xurxomf.vslauncher/config/VSLauncher/config.json` . If it's not there go to the setting page on VS Launcher and you'll have the 3 default folders. Just copy one of them as seen on the next video and open it.
{% endstep %}

{% step %}
### Replace the config.json with the old one.

Just paste or move the old config file to the new location.
{% endstep %}

{% step %}
### Restart VS Launcher

Close and open VS Launcher and magic, all your installations and versions are back!
{% endstep %}
{% endstepper %}

{% embed url="https://www.youtube.com/watch?v=5NerBys57t4" %}
Migrate to Flatpak | VS Launcher Guides
{% endembed %}

***

{% hint style="info" %}
If you find any issue report it on the [GitHub Issue Tracker](https://github.com/XurxoMF/vs-launcher/issues) and if you need help as us on the [GitHub Discussions](https://github.com/XurxoMF/vs-launcher/discussions) or on the [Official Vintage Story Discord Server](https://discord.com/channels/302152934249070593/1314991001571557488).
{% endhint %}
