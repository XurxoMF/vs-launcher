{
  description = "Unofficial launcher and version manager for Vintage Story";

  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {inherit system; config.allowUnfree = true;};
  in {
    packages.${system} = {
      default = self.packages.${system}.vs-launcher;
      vs-launcher = pkgs.callPackage ./nix { };
    };

    homeManagerModules = {
      default = self.homeManagerModules.vs-launcher;
      vs-launcher = import ./nix/hm.nix self.packages.${system}.vs-launcher;
    };
  };
}
