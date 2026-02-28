*** Settings ***
Library  SeleniumLibrary

*** Variables ***
${URL}  https://playpal-stsweng.vercel.app/profile
${BROWSER}  Chrome
${EDIT_PROFILE_LOCATOR}  css=div#user-edit
${SPORT_INPUT}  css=input.profile-tag-input
${SPORT}  Basketball

*** Keywords ***
Open Playpal Page
    Open Browser  ${URL}  ${BROWSER}
    Maximize Browser Window

Edit Profile
    Wait Until Element Is Visible  ${EDIT_PROFILE_LOCATOR}  timeout=10s
    Click Element  ${EDIT_PROFILE_LOCATOR}

Add Valid Profile Details
    Wait Until Element Is Visible  ${SPORT_INPUT}  timeout=10s
    Input Text  ${SPORT_INPUT}  ${SPORT}
    Click Button  css=.profile-save-button

Should See Profile Page
    Wait Until Page Contains Element  css=div.main-content  timeout=10s

*** Test Cases ***
Add Details To Profile
    Open Playpal Page
    Edit Profile
    Add Valid Profile Details

View Profile
    Open Playpal Page
    Should See Profile Page

Edit Details
    Open Playpal Page
    Edit Profile
    Add Valid Profile Details

