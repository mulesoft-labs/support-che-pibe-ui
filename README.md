# support-che-pibe-ui
This application serves static content for UI and includes a service to control released tools versions.

## To Start contributing:
clone https://github.com/mulesoft-labs/support-che-pibe-ui.git
cd support-che-pibe-ui
mvn clean paclage

## Mule Application
The Mule application is just exposing the static content generated in the folder src/main/resources/dist/ and controlling the caching http headers.

### Compiling and deploy
- mvn clean package
- Go to the Support organization (Okta) and deploy it through Runtime Manager

## CSS/JS Support Console
This includes the custom CSS/JS for Support Console to improve functionality and experience. The solution is a webpack script that builds the different parts for each support region

The exposed files are:

src/main/resources/dist/support-console-plus-apac.min.css
src/main/resources/dist/support-console-plus-apac.min.js
src/main/resources/dist/support-console-plus-emea.min.css
src/main/resources/dist/support-console-plus-emea.min.js
src/main/resources/dist/support-console-plus-latam.min.css
src/main/resources/dist/support-console-plus-latam.min.js
src/main/resources/dist/support-console-plus-na.min.css
src/main/resources/dist/support-console-plus-na.min.js

And the public address is https://support-che-pibe-ui.us-w1.cloudhub.io/static/*. ie: https://support-che-pibe-ui.us-w1.cloudhub.io/static/support-console-plus-latam.min.js

### Changing CSS/JS for support console
In the folder cssjs you'll find the source code for this scripts.
The src/global folder includes the code used globally.
The folder src/[region] includes functions/types used in a particular region. Useful to differenciate behaviors like determining the main region to assign a dispatched queue.

#### Compiling
The steps to compile this code are
- cd cssjs
- npm install (only the first time)
- npm run build
or per region:
- npm run build-latam
- npm run build-na
- npm run build-emea
- npm run build-apac

The scrips will be generated in src/main/resources/dist/ automatically. You can use the generated CSS/JS with the Chrome plugin to test it.

Note that the CSS/JS script are minified to improve performance.