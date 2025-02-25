---
icon: snowflake
description: If you're using NixOS follow this guide!
---

# NixOS

VS Launcher can be installed on NixOS through a Nix flake that provides a proper `vs-launcher` derivation and a [Home Manager](https://github.com/nix-community/home-manager) module to easily add working versions.

{% stepper %}
{% step %}
#### Add it as a flake input

```Nix
# flake.nix
# ...
inputs = {
  vs-launcher.url = "github:XurxoMF/vs-launcher";
};
# ...
```
{% endstep %}

{% step %}
#### Import the Home Manager module

```Nix
# home.nix
{inputs, ...}: {
  imports = [inputs.vintagestory-nix.homeManagerModules.default];
}
```
{% endstep %}

{% step %}
#### Configure using the Home Manager module

```Nix
# home.nix
{inputs, pkgs, ...}: {
  imports = [inputs.vintagestory-nix.homeManagerModules.default];

  programs.vs-launcher = {
    enable = true; # Install VS Launcher and activate the module
    installedVersions = [ # Versions to link into ~/.config/VSLGameVersions
      # Unless using an overlay, this will be the latest version from nixpkgs
      pkgs.vintagestory
    ];
  };
}
```

{% hint style="warning" %}
Game versions installed using VS Launcher likely won't work as they won't be able to find a .NET installation.
`vs-launcher.installedVersions` substitutes the non NixOS compatible `Vintagestory` binary with the derivation's wrapped one.
{% endhint %}

{% hint style="info" %}
It is up to you to manage the packages in `vs-launcher.installedVersions`, I may recommend pinning `pkgs.vintagestory`'s version using `overrideAttrs` so it doesn't change by itself.

You could also pin multiple versions to install them individually, see [Additional tips](https://vsldocs.xurxomf.xyz/get-started/installation/nixos#additional-tips).
{% endhint %}

{% hint style="info" %}
Versions installed using the Home Manager module have to be manually registered inside VS Launcher.
{% endhint %}
{% endstep %}

***

## Additional tips

Here are a few additional tips to help you on your journey:

### Install multiple Vintage Story versions

```Nix
# home.nix
{inputs, pkgs, ...}: let
  mkVintageStory = {version, hash}: pkgs.vintagestory.overrideAttrs {
    inherit version;
    src = fetchurl {
      url = "https://cdn.vintagestory.at/gamefiles/stable/vs_client_linux-x64_${version}.tar.gz";
      inherit hash;
    };
  };
in{
  imports = [inputs.vintagestory-nix.homeManagerModules.default];
  programs.vs-launcher = {
    enable = true;
    installedVersions = [
      (mkVintageStory {
        version = "1.20.4";
        hash = "sha256-Hgp2u/y2uPnJhAmPpwof76/woFGz4ISUXU+FIRMjMuQ=";
      })
      (mkVintageStory {
        version = "1.20.3";
        hash = "sha256-+nEyFlLfTAOmd8HrngZOD1rReaXCXX/ficE/PCLcewg=";
      })
    ];
  };
}
```

### Replace insecure .NET 7 with .NET 8

Here is a `pkgs.vintagestory` override that replaces `dotnet-runtime_7` with `dotnet-runtime_8`.

You can, of course, also pin the version using a method similar to the previous tip.
```Nix
vintagestory.overrideAttrs (prevAttrs: {
  buildInputs = [ dotnet-runtime_8 ];
  preFixup = ''
    makeWrapper ${dotnet-runtime_8}/bin/dotnet $out/bin/vintagestory \
      --prefix LD_LIBRARY_PATH : "${prevAttrs.runtimeLibs}" \
      --set DOTNET_ROOT ${dotnet-runtime_8}/share/dotnet \
      --set DOTNET_ROLL_FORWARD Major \
      --add-flags $out/share/vintagestory/Vintagestory.dll

    makeWrapper ${dotnet-runtime_8}/bin/dotnet $out/bin/vintagestory-server \
      --prefix LD_LIBRARY_PATH : "${prevAttrs.runtimeLibs}" \
      --set DOTNET_ROOT ${dotnet-runtime_8}/share/dotnet \
      --set DOTNET_ROLL_FORWARD Major \
      --add-flags $out/share/vintagestory/VintagestoryServer.dll

    find "$out/share/vintagestory/assets/" -not -path "/fonts/" -regex "./.[A-Z]." | while read -r file; do
      local filename="$(basename -- "$file")"
      ln -sf "$filename" "''${file%/}"/"''${filename,,}"
    done
  '';
})
```

### Fix RAM limits

```Nix
# configuration.nix
boot.kernel.sysctl = {
  "vm.max_map_count" = 262144;
};
```

***

{% hint style="info" %}
If you find any issue report it on the [GitHub Issue Tracker](https://github.com/XurxoMF/vs-launcher/issues) and if you need help as us on the [GitHub Discussions](https://github.com/XurxoMF/vs-launcher/discussions) or on the [Official Vintage Story Discord Server](https://discord.com/channels/302152934249070593/1314991001571557488).
{% endhint %}
