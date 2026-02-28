*** Settings ***
Library           Browser
Suite Setup       New Browser    headless=false
Suite Teardown    Close Browser
Test Setup        New Page    ${LOGIN_URL}

*** Variables ***
${API_BASE_URL}        http://localhost:3000
${GOOGLE_OAUTH_URL}    ${API_BASE_URL}/auth/google
${LOGIN_URL}           ${API_BASE_URL}/login

*** Test Cases ***
Render Logo And Tagline
    Get Element   img[alt*="PlayPal Logo"]
    Get Text      text=Find Your Fit. Play with Pals

Render Login Instructions And Handbook Link
    Get Text    text=Log in with your DLSU Google account
    ${link}=    Get Element   role=link[name="DLSU Student Handbook"]
    ${href}=    Get Attribute    ${link}    href
    Should Contain    ${href}    dlsu.edu.ph

Render Login Button With Icon And Text
    Get Element    role=button[name="Log In with DLSU Google Account"]

Clicking Login Button Opens Google OAuth URL
    Click    role=button[name="Log In with DLSU Google Account"]
    Wait For Navigation    url=${GOOGLE_OAUTH_URL}    timeout=10s
    ${url}=    Get Url
    Should Contain    ${url}    /auth/google
