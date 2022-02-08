[[_TOC_]]
# Introduction 
**Build Statistics** widget is a tool which can provides a Pie chart representing data related to Azure pipeline build results in a provided duration. Using this widget users can have a statistics of all builds either within the current project or access all projects in all Collections (in case of Azure DevOps Server).
# Configuration
- Drag the "Build Statistics" widget on the Azure Dashboard.
- Click on Settings button on top right corner of the widget and select Configuration.
- It will popup the configuration window and update the fields.
  - Title: It will be the widget title.
  - Wiget color: Background color of the widget.
  - Access all project accross all Collections - By default this checkbox is unchecked. If unchecked the widget will only show the builds from Current Project. If checked, then widget will show the builds from All Projects accross All Collections (in case of Azure DevOps Server).
  - User Id: This field is required if 'Access all project accross all Collections' is checked. It requires User id which has atleast Read access to all of the collections.
  - PAT/Password: This field is required if 'Access all project accross all Collections' is checked. It requires password or PAT for the user which has atleast Read access to all of the collections.
  - Duration (days): The dropdown values to select the days since when the builds data will be collected.
# Support
For support, please write an email to tdalui@gmail.com.