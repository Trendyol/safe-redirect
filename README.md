# safe-redirect

safe-redirect is a library which resolves open-redirection vulnerability when we need to make client-side redirection to a path taken from query string.

## Example

For example, we have `/login` page and after successful login we need to redirect user to a path. Referrer can state the redirection path using `callback` query string parameter. Url looks like:

`https://domain.com/login?callback=/payment`

In `/login` page, after successful login, we implement the aforementioned requirement in this way:

```
// successful login
const path = new URLSearchParams(window.location.search).get("callback");
window.location.assign(path);
```

And here we have a __open-redirection vulnerability__

#### Case 1

`https://fake.com` can redirect user to `domain.com/login?callback=https://fake.com/fake` , after successful login, the user will be redirected to `https://fake.com/fake`.

#### Case 2

A site can redirect user to `domain.com/login?callback=javascript:alert(document.cookie)` and execute custom javascript code. (sensitive user data can be stolen, etc).

#### Solution

safe-redirect library solves this vulnerability. Simply:

`npm i @trendyol-js/safe-redirect`

```
import { redirect } from "@trendyol-js/safe-redirect";

// successful login
redirect("callback"); // give name of the query parameter
```

---

##### Feel free to contribute
