# client-oauth2-request

    client-oauth2 request

```ts
import getToken from 'gitee-api-token';
import ClientRequest from 'client-oauth2-request';

(async () =>
{

	let token = await getToken({
		access_token: 'access_token',

		//username: '',
		//password: '',

		clientId: '',
		clientSecret: '',

		scopes: 'pull_requests',
	})
		.catch(function (err)
		{
			console.log(err);
		})
	;

	if (!token)
	{
		console.error(`can't get token`);

		return;
	}

	let rq = new ClientRequest(token, {
		apiRoot: 'https://gitee.com/api/'
	});

	let rp = rq.sign('/v5/repos/oschina/git-osc/pulls');

	let r = await rq.get(rp.url)
		.catch(function (err)
		{
			console.error(err);
		})
	;

	console.log(r);

})();
```
