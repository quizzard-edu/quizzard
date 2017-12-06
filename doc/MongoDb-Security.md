Created user/pass authentication for mongodb, any connection to mongodb is authenticated, only one auth needs to be created (application server)

Step 1 Create administrator account:
1. console 1 run: `mongod --port 27017 --dbpath /data/db`
2. console 2 run:`mongo --port 27017 quizzard`
3. console 2 run: `use admin`
4. console 2 run: 
```
db.createUser({
  user : "admin",
  pwd  : "pass",
  roles: [
    { 
      role: 'root', db: 'admin'
    }
  ]
});
```

Step 2 Create application server account

1. console 1 run: `mongod --auth --port 27017 --dbpath /data/db`
2. console 2 run: `mongo -u admin -p pass --authenticationDatabase admin`
3. console 2 run:
```
db.createUser({
  user : "appuser",
  pwd  : "apppass",
  roles: [
    { 
      role: 'readWrite', db: 'quizzard'
    }
  ]
});
```

Now we have successfully created an authenticated mongodb. Only with this account can the application server read/write to the db.

When initializing the db in /server/db.js, call this function to authenticate:
`db.authenticate('appuser', 'apppass', function(err, result) {});`

Run the mongod instance like this for auth:
`mongod --auth --port 27017 --dbpath /data/db`


Another layer of protection we can add is on the server side, only allowing the application server to connect to DB. This is by configuring the firewall iptables:

```
iptables -A INPUT -s <ip-address> -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -d <ip-address> -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
```
In this case the <ip-address> would be our application server (quizzard)

Lastly, we will need to drop all other incoming/outgoing traffic:

```
iptables -P INPUT DROP

iptables -P OUTPUT DROP
```

