---
description: Easy to setup, hard to translate.
icon: '1'
---

# Option 1

This first option is the easiest to set up but once you start translating and updating translations it'll be harder for you as you'll have to manually look up the new keys and translate them.

If you want to use this option just follow the next steps:

{% stepper %}
{% step %}
### **Download the en-US.json**

You can download this file from this link: [en-US.json](../../../src/renderer/src/locales/en-US.json). This one is the base language so it'll contain all the keys.
{% endstep %}

{% step %}
### **Translate it**

Open the file with [Visual Studio Code](https://code.visualstudio.com/) or any other editor, like Notepad++ or Windows file editor, and translate the keys as you need.

{% hint style="info" %}
You can only change the right part. The left one is the key, that's the one used to reference the sentence so don't touch it.
{% endhint %}

{% hint style="warning" %}
Don't translate things like \`\{{name\}}\`, \<button /> and things like that. Those will be replaced with names, versions, buttons... before rendering.
{% endhint %}
{% endstep %}

{% step %}
### **Send it on Discord**

Once you've finished the translation just send it to me on the mod forum post on the [official Vintage Story Discord server](https://discordapp.com/channels/302152934249070593/1314991001571557488) with this info:

```
<@556249326951727115>
Name for credits: Your name or Anonymous
Lang code: es-ES, en-US, fr-FR...
Lang name: Español (España), English, Français...
```
{% endstep %}
{% endstepper %}

And that's it! I'll download and add the file on the next update.

If I find something wrong with translations I'll ping you back on the same channel.
