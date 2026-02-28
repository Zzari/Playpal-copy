*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}                https://playpal-stsweng.vercel.app/home
${BROWSER}            Chrome
${CREATE_BUTTON}      css=button#createpost            # "Create an Event" button
${CANCEL_BUTTON}      xpath=//button[contains(text(), "Cancel")]  # The Cancel button inside the form

*** Keywords ***
Open Playpal Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Page Contains Element    ${CREATE_BUTTON}

*** Test Cases ***
User Can Cancel Creating an Event
    Open Playpal Page
    Click Element    ${CREATE_BUTTON}
    Wait Until Element Is Visible    ${CANCEL_BUTTON}
    Click Button     ${CANCEL_BUTTON}
    Wait Until Page Contains Element    ${CREATE_BUTTON}    # Check form was closed
