# Quizzard

## Contents

0. [Introduction](#introduction)
1. [Setup](#quick-setup)

## Introduction

Quizzard is a web-based quiz application designed to be used for educational
purposes.

## Setup

These instructions will guide you through setting up an instance of Quizzard.

Before continuing, make sure that you have the dependencies `nodejs`, `npm`
and `mongodb` installed.

0. Clone the repository.

  ```
  $ git clone https://github.com/quizzard-edu/quizzard
  ```

1. Install the Node module dependencies.

  ```
  $ cd quizzard
  $ npm install
  ```

2. Configure server settings and SSL Certification
   * Note: To run this application locally you do not have to change any configuration settings.
    1. Go to [server/config.js](server/config.js)
    2. Change the https and http ports.
    3. For `hostName` Enter the public web-address for this website, ex (www.quizzard.com)
    4. You can change the session expiration time, by default it is set to 2 hours.
    5. Replace the default self-signed SSL Certificates with your certificates.

  To generate your own Self-Signed Certificate, Run the following script on your shell (terminal):
  - Note: Make sure to have openssl installed on your shell.
    ```
    $ sh scripts/certificateGenerator
    ```

3. To secure MongoDB authentication and advanced firewall rules follow the steps provided under [doc/MongoDb-Security](quizzard/doc/MongoDb-Security.md).
   - Note: You can skip this step if you are running this in a local environment (localhost).

4. You can now launch the server by running

  ```
  $ npm start
  ```

  If haven't changed any settings you should now be able to access Quizzard by visiting
  https://localhost:8080 in your browser.

5. The port on which the server runs and the mongodb connection settings can
  be modified through the following environment variables:

  * `DB_HOST` - mongodb database server address (default: localhost)
  * `DB_PORT` - mongodb connection port (default: 27017)
  * `DB_NAME` - name of appplication's database within mongodb (default: quizzard)

6. Create an admin account for the application by running `node setup.js`.
  It will prompt you for a username and password.

7. After you have set up an admin account, load the Quizzard application and log
  in with the account that you created. You now have a working instance of
  Quizzard which you can use.

## Contact

If you have a question, find a bug, need a feature, or want to contribute,
please email: quizzard.edu@gmail.com

## Credits

Quizzard's development started at and has been supported by the University of
Toronto Mississauga. Below is a list of the contributors so far.

* Alexei Frolov: since September 2016
* Larry Yueli Zhang: since September 2016
* Ramy Esteero: since September 2017
* Mohammed Khan: since September 2017
* Darshan Mehta: since September 2017
* Mohamed Mohamed: since September 2017
* Ahmed Qarmout: since September 2017

Supervisor: Larry Yueli Zhang

