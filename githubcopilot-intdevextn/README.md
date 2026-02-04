# RK Intelligent Development Platform (IDP) Extension

A professional VS Code extension that provides a unified interface for enterprise development tools and metrics. The RK IDP extension integrates with various enterprise services to track development activities, code quality, agile workflows, and DevSecOps metrics.

## Features

### 🏢 **Enterprise Integration Dashboard**
- **Professional Sidebar**: Custom RK IDP sidebar with organized tool sections
- **Real-time Status**: Live configuration status indicators for all integrated services
- **Interactive Information**: Expandable info panels with detailed feature descriptions

### 📊 **Four Main Categories**

#### 🔍 **History**
- **GitHub Copilot**: Track AI suggestions acceptance rate and chat conversation history
- **Enterprise GitHub**: Repository activity tracking, pull request analytics, and code review metrics

#### ✅ **Quality**
- **SonarQube**: Static code analysis, code smell detection, and quality gate compliance
- **Checkmarx**: Security vulnerability scanning and SAST analysis
- **AppsecJira**: Application security issue lifecycle management

#### 🚀 **Agile**
- **Enterprise JIRA**: Sprint management, velocity tracking, and burndown analytics

#### 🔒 **DevSecOps**
- **DORA Metrics**: Deployment frequency, lead time, change failure rate, and recovery time

## Usage

### DORA Metrics Dashboard

The dashboard is now ready to use! When you open the extension and navigate to the **DevSecOps > DORA** section, you can:

1. **Enter a repository name** (e.g., `microsoft/vscode`)
2. **Select your time period and environment**
3. **Click "Calculate DORA Metrics"**
4. **Watch the stunning animations** as data loads
5. **View beautiful metric cards** with trends
6. **Analyze visual charts** and deployment history

The DORA Metrics dashboard provides:
- **4 Core DORA Metrics Cards** with professional styling and trend indicators
- **Interactive Time Period Selection** (7 days to 12 months)
- **Environment Filtering** (All, Production, Staging, Development)  
- **Visual Charts** for deployment frequency trends and lead time distribution
- **Comprehensive Results Table** with recent deployments, status indicators, and commit tracking
- **Mock Data Generation** for demonstration and testing purposes

## Installation

1. Install the extension from the VS Code marketplace
2. The RK IDP sidebar will appear in your activity bar
3. Configure your enterprise service connections in settings

## Configuration

The extension provides comprehensive configuration settings for all integrated enterprise services. Each service can be individually configured with appropriate credentials and endpoints.

### How to Access Settings

#### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type and select **"RK IDP: Open Settings"**

#### Method 2: VS Code Settings UI
1. Go to **File → Preferences → Settings** (or `Ctrl+,`)
2. Search for **"RK IDP"** in the settings search bar
3. Configure all settings through the user-friendly interface

#### Method 3: Settings JSON
1. Open **File → Preferences → Settings**
2. Click the **"Open Settings (JSON)"** icon in the top right
3. Add RK IDP configuration with full IntelliSense support

### Quick Access Summary

Users can now access settings through:

- **Command Palette**: `Ctrl+Shift+P` → "RK IDP: Open Settings"
- **VS Code Settings**: File → Preferences → Settings → Search "RK IDP"
- **Settings JSON**: Direct editing with IntelliSense support

### Configuration Settings

#### 🤖 GitHub Copilot
```json
{
  "rk-idp.copilot.username": "your-github-username"
}
```

#### 🌐 Enterprise GitHub
```json
{
  "rk-idp.github.baseUrl": "https://github.enterprise.com",
  "rk-idp.github.userPAT": "your-personal-access-token"
}
```

#### 🔍 SonarQube
```json
{
  "rk-idp.sonarqube.baseUrl": "https://sonarqube.enterprise.com"
}
```

#### 🛡️ Checkmarx
```json
{
  "rk-idp.checkmarx.tenant": "your-tenant-id",
  "rk-idp.checkmarx.baseUrl": "https://checkmarx.enterprise.com",
  "rk-idp.checkmarx.userApiKey": "your-api-key"
}
```

#### 🔐 AppsecJira
```json
{
  "rk-idp.appsecjira.username": "your-username",
  "rk-idp.appsecjira.baseUrl": "https://appsec.jira.enterprise.com",
  "rk-idp.appsecjira.userPAT": "your-personal-access-token"
}
```

#### 📋 Enterprise JIRA
```json
{
  "rk-idp.jira.username": "your-username",
  "rk-idp.jira.userPAT": "your-personal-access-token",
  "rk-idp.jira.baseUrl": "https://jira.enterprise.com"
}
```

#### 📈 DORA Metrics
```json
{
  "rk-idp.dora.githubBaseUrl": "https://github.enterprise.com",
  "rk-idp.dora.githubUserPAT": "your-personal-access-token"
}
```

### Complete Configuration Example

```json
{
  "rk-idp.copilot.username": "john.doe",
  "rk-idp.github.baseUrl": "https://github.enterprise.com",
  "rk-idp.github.userPAT": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "rk-idp.sonarqube.baseUrl": "https://sonarqube.enterprise.com",
  "rk-idp.checkmarx.tenant": "company-tenant",
  "rk-idp.checkmarx.baseUrl": "https://checkmarx.enterprise.com",
  "rk-idp.checkmarx.userApiKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "rk-idp.appsecjira.username": "john.doe",
  "rk-idp.appsecjira.baseUrl": "https://appsec.jira.enterprise.com",
  "rk-idp.appsecjira.userPAT": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "rk-idp.jira.username": "john.doe",
  "rk-idp.jira.userPAT": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "rk-idp.jira.baseUrl": "https://jira.enterprise.com",
  "rk-idp.dora.githubBaseUrl": "https://github.enterprise.com",
  "rk-idp.dora.githubUserPAT": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

## Status Indicators

The extension provides real-time visual feedback for configuration status:

- 🔴 **Red**: "Not configured" - Setting is empty or missing
- 🟢 **Green**: "Configured" - Setting has been properly configured

Status indicators automatically update when you modify settings, providing immediate feedback on your configuration progress.

## Commands

| Command | Description |
|---------|-------------|
| `RK IDP: Open Settings` | Quick access to extension configuration settings |

## Requirements

- VS Code 1.102.0 or higher
- Enterprise network access to configured services
- Valid credentials for each service you want to integrate

## Security Notes

- Store sensitive tokens and API keys securely
- Use workspace-specific settings for team configurations
- Regularly rotate access tokens and API keys
- Follow your organization's security policies for credential management

## Troubleshooting

### Configuration Issues
1. Verify all URLs are accessible from your network
2. Check that credentials are valid and have appropriate permissions
3. Ensure proxy settings are configured if required

### Status Not Updating
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check VS Code Developer Console for error messages
3. Verify configuration syntax in settings.json

## Known Issues

- Settings require VS Code restart for some advanced enterprise proxy configurations
- Large enterprise environments may experience slight delays in status updates

## Release Notes

### 1.0.0

- Initial release with enterprise tool integration
- Professional sidebar interface with four main categories
- Real-time configuration status indicators
- Comprehensive settings for all enterprise services
- Interactive information panels with detailed feature descriptions

---

## Support

For enterprise support and custom configurations, please contact your organization's development tools team.

**Enjoy your enhanced development experience with RK IDP!**
