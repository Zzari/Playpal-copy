*** Settings ***
Library  SeleniumLibrary
*** Variables ***
${URL}  https://playpal-stsweng.vercel.app/home
${BROWSER}  Chrome
${BUTTON}   css=button#createpost
${POST_TITLE}      css=input.post-title-input
${SPORT_LIST}     css=select.post-tag-input.sport 
${LOCATION_INPUT}  xpath=(//input[@class="post-tag-input"])
${DATETIME_INPUT}  css=input.post-date-input
*** Keywords ***
Open Playpal Page
    Open Browser  ${URL}  ${BROWSER}
    Maximize Browser Window
Create a Post
    Input Text  ${POST_TITLE}  Test Basketball Event
    Select From List By Label  ${SPORT_LIST}  Basketball
    Input Text  ${LOCATION_INPUT}  Razon 7th Floor
    Input Text  ${DATETIME_INPUT}  2025-08-05T10:00

*** Test Cases ***
Create Post
    Open Playpal Page
    Click Element  ${BUTTON}
    Create a Post
