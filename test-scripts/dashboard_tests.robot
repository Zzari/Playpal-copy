*** Settings ***
Library  SeleniumLibrary
*** Variables ***
${URL}  https://playpal-stsweng.vercel.app/home
${BROWSER}  Chrome

*** Keywords ***
Open Playpal Page
    Open Browser  ${URL}  ${BROWSER}
    Maximize Browser Window

Should See Posts Page
    #find posts list
    Wait Until Page Contains Element  css=div.post-list  timeout=10s

*** Test Cases ***
View Posts
    Open Playpal Page
    Should See Posts Page
