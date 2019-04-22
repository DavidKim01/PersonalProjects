
# Test Plan for PACE Bank Web Application

**Author**: David Kim

## 1 Testing Strategy

### 1.1 Overall strategy

Unit testing will be done on a function to function basis through peer code review and using testing technologies such as Mocha individually. As for integration testing, all testing will be automated as to ensure that time is used efficiently to focus more on important aspects of implementing the software. Finally, regression-testing will be performed everytime a new feature is added or changed as well.

### 1.2 Test Selection and Adequacy Criterion

Combination of both white and black box(grey) testing techniques could help the app development process be quicker. Since some attributes only require simple test where the condition might change from true to false we can use use black box testing. While other attribute involves multiple parts of the function working in unison, which requires a more in depth look of white box testing.

For this app I used simple testing of our functionality doing QA duties whenever a new feature is added. Through direct manipulation of the app using a local server all tests were successful in the final build.

## 2 Test Cases

**__Note__**: The "context menu" refers to the navbar menu located at the top of the website.

| Test Number   | Test Purpose  | Test Steps | Expected Result | Actual Result | Pass/Fail Information | Additional Information |
|:-------------:|:-------------:|:-------------|:-------------:|:-------------:|:-------------:|:-------------:|
| 1 | To determine if an account can be created. | Create an account.  Logout. Then log back in with the same credentials.|The account is successfully created and stored on the server |The account can be successfully created using the "Sign Up" Menu option. | Pass: Account created. |The user must must supply the correct credentials otherwise they will not be authorized. |
| 2 | To check if products are properly added to the user. |Log in. Purchase an item. View accounts/balances|The account is successfully added.|Product is added to the users account page. |Pass: Product added. |Producst are added through the /apply section. |
| 3 | To ensure anonymouse users can not access the approval or accounts page. |Access the site. Attempt to GET /accounts or /approved pages.|The user is denied access and served a 401 Response. | The server denies access to the anonymous(not logged in) user |Pass: User access denied.|A user must first log in in order to access these pages. |
| 4 | Check accounts/balances |Login. Navigate or click to the accounts page.|The users account data is served.|The user is not denied acces from the server via the middleware function. |Pass: Success in loading account data. |Once an account is created the details are only viewable to that user. |
| 5 | To ensure that the correct minimum deposit values are working as intended |Create a new account or login. Access the apply page. Attempt to enter an invalid initial minimum balance deposit amount.|The product is not added and the user is denied purchase | The User is served an error and is forced to resubmit with proper values |Pass: Works as intended. |User is authorized to view page but is denied access to the approval page until they specify a correct amount |