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
  cd quizzard
  npm install
  ```

2. You can now launch the server by running
  ```
  npm start
  ```

  By default, it will listen on port 8000.

3. The port on which the server runs and the mongodb connection settings can
  be modified through the following environment variables:

  * `QUIZZARD_PORT` - the port on which the server listens (default: 8000)
  * `DB_HOST` - mongodb database server address (default: localhost)
  * `DB_PORT` - mongodb connection port (default: 27017)
  * `DB_NAME` - name of appplication's database within mongodb (default: quizzard)
