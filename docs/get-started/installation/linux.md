---
description: If you're using Linux follow this guide!
icon: linux
---

# Linux

VS Launcher works on ANY Linux distro thanks to the AppImage compilation we're using.

Installing it on Linux is as easy as downloading the AppImage and double clicking it.... that's it. Let's get started:

{% stepper %}
{% step %}
### Go to the [GitHub Releases Page](https://github.com/XurxoMF/vs-launcher/releases)

On that page you'll see all the available versions to download.
{% endstep %}

{% step %}
### Download the Linux version

On the releases page, the first version is always the last one. There you'll see a table with the different files to download. Just click on the Windows one like on the next image:

![](<../../.gitbook/assets/imagen (1).png>)
{% endstep %}

{% step %}
### Move the AppImage to an accesible location

For example the Desktop, the you'll be able to open it whenever you want.

{% hint style="warning" %}
Some users reported that AppImage Launcher is breaking automaitc updates so if you want to use it make sure to download the latest VS Launcher version when it's published!
{% endhint %}
{% endstep %}

{% step %}
### Add execution persmissions

This should be done by default by sometimes you've to manually do it.

```sh
chmod +x ./vs-launcher-X.X.X.AppImage
```
{% endstep %}

{% step %}
### Open VS Launcher

Double click the VS Launcher AppImage and that's it, ready to use!
{% endstep %}

{% step %}
### Install depencies

VS Launcher does not need any dependecy to work but Vintage Story does so follow the next steps.
{% endstep %}
{% endstepper %}

## Install Vinstage Story dpendencies

VS Launcher does not need any dependecy to work but Vintage Story does. I wanted to make this process automátically when you run the game but Linux has a lot of distros and I can't personalize it to work on all of them so you'll have to do it manually.

Here I'll explain how to do it on Debaian distros like Ubuntu, Linux Mint and so on. If you're using anotherone you'll have to check it on Google, if you know how to do it on other distros you can let me know to update this guide!

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
### Install OpenAL

```sh
sudo apt install libopenal-dev
```
{% endstep %}

{% step %}
### Install mono-complete

```sh
sudo apt install mono-complete
```
{% endstep %}

{% step %}
### Fix RAM limits

```sh
sudo sysctl -w vm.max_map_count=262144
```
{% endstep %}
{% endstepper %}

{% hint style="info" %}
If you find any issue report it on the [GitHub Issue Tracker](https://github.com/XurxoMF/vs-launcher/issues) and if you need help as us on the [GitHub Discussions](https://github.com/XurxoMF/vs-launcher/discussions) or on the [Official Vintage Story Discord Server](https://discord.com/channels/302152934249070593/1314991001571557488).
{% endhint %}

