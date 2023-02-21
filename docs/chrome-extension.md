import FeatureAvailability from '@site/src/components/FeatureAvailability';

# About DataHub Chrome Extension (beta)

<FeatureAvailability/>

DataHub provides a Chrome extension that allows users to get insights about their data assets from DataHub right inside their source system. Right now, the extension only supports Looker, but support for other source systems will be added.

This extension is Acryl branded, but any DataHub instance (Self-Hosted or Managed DataHub) will work just fine.

## Chrome Extension Setup, Prerequisites, and Permissions

In order for the DataHub Chrome extension to work with your DataHub instance, some setup is necessary.
* Your DataHub instance needs to be up to date with at least version v0.10.1 or newer
* Deploy your `datahub-frontend-react` container with the following environment variables set:
    - `AUTH_COOKIE_SAME_SITE` = `"NONE"`
    - `AUTH_COOKIE_SECURE` = `true`

Setting those variables will allow the cookies used for authentication to be shared with your Chrome extension, otherwise you will get stuck in an authentication loop. 

## Installing the Extension

In order to install DataHub's Chrome extension:

1. Navigate to the extension's page in the Chrome web store: https://chrome.google.com/webstore/detail/datahub-chrome-extension/aoenebhmfokhglijmoacfjcnebdpchfj
2. Click "Add to Chrome" on the top right of the page
3. Click "Add extension" when prompted for confirmation

## Configuring the Extension

Once you have your extension installed, you'll need to configure it to work with your DataHub deployment.

1. Click the extension button on the right of your browser's address bar to view all of your installed extensions. Click on the newly installed DataHub extension.

<p align="center">
  <img width="70%"  src="https://raw.githubusercontent.com/datahub-project/static-assets/main/imgs/chrome_extension/extension_open_popup.png"/>
</p>

2. Fill in your DataHub domain and click "Continue" in the extension popup that appears.

<p align="center">
  <img width="50%"  src="https://raw.githubusercontent.com/datahub-project/static-assets/main/imgs/chrome_extension/extension_enter_domain.png"/>
</p>

If your organization uses standard SaaS domains for Looker, you should be ready to go!

### Additional Configurations

Some organizations have custom SaaS domains for Looker and some DataHub deployments utilize **Platform Instances** and set custom **Environments** when creating DataHub assets. If any of these situations applies to you, please follow the next few steps to finish configuring your extension. Otherwise, feel free to skip to **Using the Extension**.

1. Click on the extension button and select your DataHub extension to open the popup again. Now click the settings icon in order to open the configurations page.

<p align="center">
  <img width="50%"  src="https://raw.githubusercontent.com/datahub-project/static-assets/main/imgs/chrome_extension/extension_open_options_page.png"/>
</p>

2. Fill out any and save custom configurations you have in the **TOOL CONFIGURATIONS** section. Here you can configure a custom domain, a Platform Instance associated with that domain, and the Environment set on your DataHub assets. If you don't have a custom domain but do have a custom Platform Instance or Environment, feel free to leave the domain field empty.

<p align="center">
  <img width="70%"  src="https://raw.githubusercontent.com/datahub-project/static-assets/main/imgs/chrome_extension/extension_custom_configs.png"/>
</p>

## Using the Extension

Once you have everything configured on your extension, it's time to use it!

1. First ensure that you are logged in to your DataHub instance.

2. Navigate to Looker and log in to view your data assets.

3. Navigate to a page where DataHub can provide insights on your data assets (Dashboards and Explores).

4. Click the Acryl DataHub extension button on the bottom right of your page to open a drawer where you can now see additional information about this asset right from your DataHub instance.

<p align="center">
  <img width="70%"  src="https://raw.githubusercontent.com/datahub-project/static-assets/main/imgs/chrome_extension/extension_view_in_looker.png"/>
</p>

### Videos

**DataHub 2022 in Review - Including Chrome Extension Demo**

<p align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/ECxIMbKwuOY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>


## FAQ and Troubleshooting

*Need more help? Join the conversation in [Slack](http://slack.datahubproject.io)!*
