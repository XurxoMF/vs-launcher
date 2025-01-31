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

{% hint style="info" %}
If you installed Vintage Story using Flatpak you can skip the rest of this guide, as any dependencies will come pre-installed in the sandbox.
{% endhint %}

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

***

{% hint style="info" %}
If you find any issue report it on the [GitHub Issue Tracker](https://github.com/XurxoMF/vs-launcher/issues) and if you need help as us on the [GitHub Discussions](https://github.com/XurxoMF/vs-launcher/discussions) or on the [Official Vintage Story Discord Server](https://discord.com/channels/302152934249070593/1314991001571557488).
{% endhint %}
