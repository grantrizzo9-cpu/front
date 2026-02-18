{ pkgs, ... }: {
  # See https://docs.jetpack.io/devbox/configuration for more details
  # about the devbox.json file.
  packages = [
    "nodejs@20"
  ];

  # Additional shell commands that should run before shell startup.
  init_hook = [
    "npm install"
  ];

  # IDX-specific configuration
  # See https://developers.google.com/idx/guides/customize-idx-env
  idx.dev.start = {
    # This is the command that starts your application.
    # It's what runs in the terminal when the environment starts.
    web = {
      command = ["npm" "run" "dev"];
      manager = "web";
    };
  };

  # This is the configuration for the IDX preview.
  # Last attempt to fix the environment.
  idx.previews
    web = {
      title = "Web App";
      manager = "web";
    };
  };
}
