vs-launcher: {
  config,
  pkgs,
  lib,
  ...
}: let
  inherit (lib) mkIf mkEnableOption mkOption types;
  cfg = config.programs.vs-launcher;
in {
  options.programs.vs-launcher = {
    enable = mkEnableOption "VS Launcher";
    installedVersions = mkOption {
      type = types.listOf types.package;
      default = [];
      description = "List of Vintage Story packages to add to VS Launcher's GameVersions directory";
    };
  };
  config = mkIf cfg.enable {
    home.packages = [vs-launcher];

    xdg.configFile = builtins.listToAttrs (builtins.map (
        vs: {
          name = "VSLGameVersions/${vs.version}";
          value.source = pkgs.stdenv.mkDerivation {
            pname = "VSLGameVersion";
            inherit (vs) version;
            phases = ["installPhase"];
            installPhase = ''
              cp -r ${vs}/share/vintagestory $out
              chmod +w $out
              mv $out/Vintagestory $out/Vintagestory-unwrapped
              cp ${vs}/bin/vintagestory $out/Vintagestory
            '';
          };
        }
      )
      cfg.installedVersions);
  };
}
