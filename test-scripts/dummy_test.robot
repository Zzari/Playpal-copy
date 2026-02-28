*** Settings ***
Documentation     Dummy test
Library           SeleniumLibrary

*** Variables ***
${BROWSER}        headlesschrome
${DELAY}          1

*** Test Cases ***
Dummy Test That Always Passes
    [Documentation]    A simple test that opens a page and verifies the title
    [Tags]             dummy
    
    # Open browser
    Open Browser    https://www.google.com    ${BROWSER}
    
    # Set a small delay
    Sleep    ${DELAY}
    
    # Get and log the page title
    ${title}=    Get Title
    Log    Page title is: ${title}
    
    # This test will always pass
    Should Not Be Empty    ${title}
    
    # Close the browser
    Close Browser
