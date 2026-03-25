
- [x] 1. Explain how to setup email correctly in App Engine.
    > **Explanation:** For App Engine, you should put your actual credentials directly into the `env_variables` section of **`app.yaml`**. While you have a `.env` file for local testing, the `app.yaml` is what App Engine uses to set environment variables on the live server. I have updated `app.yaml` with clearer placeholders for you.
- [x] 2. Update Node.js version to resolve GCP warnings (`nodejs22`).
- [x] 3. Use this file for task tracking.
- [x] 4. Lets make sure we create a .gitignore file to ignore the .env file and anything else containing sensitive information.
- [x] 5. the app.yaml also contains sensitive information. rather than leaving it there, lets include a function in our deployment script that pulls the fields from our ignored .env file and injects them into the app.yaml file before deployment.
- [x] 6. Resolve email sending failure (535 Authentication Error).
    > **Findings:** The logs confirm an `Invalid login: 535-5.7.8 Username and Password not accepted` error. 
    > **Resolution:** You must use a **Google App Password** instead of your main password. 
    > 1. Enable 2FA on your Google Account (`admin@opnemover.co.uk`).
    > 2. Go to [My Account Security](https://myaccount.google.com/security).
    > 3. Search for "App Passwords" and create one for "Mail" and "Windows Computer" (or "Other").
    > 4. Use that 16-character code as your `EMAIL_PASS` in the `.env` file.
    > 5. Redeploy using `.\deploy_app_engine.ps1`.
- [x] 7. It seems that this is still not working. can we create a local test script to test login and sending functionality using the given credentials?
    > **Result:** Success! Verified locally after correcting the domain typo in `.env` (`openmover` instead of `opnemover`).
- [x] 8. It seems that the email address and passwords are not being correctly injected as the config on the gcloud is showing ${EMAIL_USER} and ${EMAIL_PASS} instead of the actual values. lets fix it
- [x] 9. Lets add logging into the deployment script so we can see the literal variables we're pushing to gcloud. - obviously ignore the password in the logs. 
- [x] 10. didn't seem to print it in the output. we want to see the content of the pushed app.yaml to verify the variables are being injected correctly. 
- [x] 11. we seem to have broken the deployement expected <block end> but found <scalar> error. 
- [x] 12. The logging when sending an email from the booking form is now reporting "No recipients defined". Fix it. 
    > **Fix:** Aligned the `name` attributes in `index.html` with the variables expected by `server.js`.
- [x] 13. Its all working but lets make the response email and the questionnaire look similar to our original Auto_reponse_email.html file. 
    > **Fix:** Applied the dark theme (#1a1a1a) and gold accents (#cda434) to the automated emails in `server.js` and the UI in `questionnaire.html`.
- [x] 14. Lets make sure the popup after submission makes it very clear the user should check their email to continue their viewing request. 
- [x] 15. lets add some questions to the questionnaire words to the effect
    * What percentage deposit do you have available?
    * What is your current living situation? (e.g. renting, living with family, etc.)
    * Have you instructed a solicitor yet?
    * Are you able to provide proof of funds? ( add an optional file upload field )
    * (If the user selects they have a property they are selling show the following question) Do you already have a buyer lined up for your property? - Is your buyer in a position to proceed? (e.g. mortgage agreed, no chain, etc.)
- [x] 16. Fix the spin button for the deposit field.  - its not correctly css / themed in keeping with the rest of the questionnaire.
- [x] 17. Let put some working at the top of the questionnaire to say thank you ufor youru interest, and explaining nicely that the more information they are able to provide the more it helps us with their request. 
- [x] 18. lets make sure there is a "perfer not to say" option for all questions where this is applicable. 
- [x] 19.  The deposit field should is still not correctly styled. compare it to the drop downs. Also the proof of funds field does not have a styled button. fix this too. verify locally before we deploy
- [x ] 20. Lets reorder the questions to make more sense. if the user selected "nothing to sell" then the questions about Living Situation are not relevant ( hide and show as appropriate). Lets make the quetsions a little more friendly. "Your current buying situation" etc.  lets also have a sub caption which just explains a little why the information is important, and whta it might mean. 
- [x] 21. Move your current living situation question to position 2. there is no need to ask if the user is selling if they select renting or living with parents. 
- [x] 22. Change the Submit request button to something like "Finalise Viewing Request". Make sure the popup after submission makes it very clear the user should now expect to hear from the team within 24 hours. 
- [x] 23. make sure selling your property questions are not displayed if living situation is renting or living with parents. 
- [x] 24. Lets check the wording and clean it as appropriate to make it sound more natural and less like a form on the questionnaire.  

 -[ ] 25. Lets create a new page that explains the OpenMover.co.uk business, accessable from the footer of all the pages,  for sellers  A easy to use Unique Selling Workflow and bespoke website sales solution that allows YOU not the estate agent to manage your own property sale. Walking you though each step of the sales process with advice, suggestions and access to various services that can help you sell your home as you go, with built in check lists and advice.  with suggetions about each step of the process as you go ( a Unique Property Sales Wizard) . also hosted for free on the openmover.co.uk search portal.  