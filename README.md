# README

This demo app is based on this tutorial:
https://blog.heroku.com/a-rock-solid-modern-web-stack

# Quick Start Guide

This guide will walk you through deploying a Rails 5.2 API + ReactJS + ActiveAdmin application on [Hephy Workflow][]. The app was created using this [tutorial](https://blog.heroku.com/a-rock-solid-modern-web-stack).

We are using a sqlite3 hack in the buildpacks in order to make it easy to deploy without external db for this demo app and because sqlite3 is still the greatest production db somewhere. :joy: Please use PostgreSQL or another external db in real production environments. Who is to say that Hephy Workflow is not even greater than Heroku because we support sqlite3 in production? This makes us so proud so we will insert the Martin Fowler squirrel emoji here -> :squirrel: . [Disclaimer][]

## Requirements

* A Kubernetes Cluster ([minikube quickstart](https://www.teamhephy.com))
* Hephy Workflow deployed on Kubernetes ([www.teamhephy.com](https://www.teamhephy.com))

You can start with Minikube Quick Start guide and then deploy Hephy Workflow instead of Deis using instructions on [www.teamhephy.com](https://www.teamhephy.com) website. The process is the same. Only the helm chart location changes for Hephy Workflow.

## Pre-Deploy (Set Environment Variables)

```console
$ git clone https://github.com/teamhephy/example-rails5-reactjs.git
$ cd example-rails5-reactjs
$ deis create rocksolidapp
Creating Application... done, created rocksolidapp
Git remote deis successfully created for app rocksolidapp.
```

Now we need to set some environment variables. Devise and Rails both need a `secret_key_base` environment variable set. To generate your own secret run this command:

```console
$ rake secret
4fe509360dd89d746b23f2239435218b049bb65aaac5a2301c0d0a2e0bef7ace05b3105fb8f7fe9aa5fc12bc3a4bf7a0f516a8ac8ee279913970be5b6db6a628
```

If you do not have rails or rake, then just go ahead and run this command to set the environment variables:

```console
$ deis config:set BUILDPACK_URL=https://github.com/heroku/heroku-buildpack-multi RAILS_ENV=production SECRET_KEY_BASE=4fe509360dd89d746b23f2239435218b049bb65aaac5a2301c0d0a2e0bef7ace05b3105fb8f7fe9aa5fc12bc3a4bf7a0f516a8ac8ee279913970be5b6db6a628
Creating config... done

=== rocksolidapp Config
BUILDPACK_URL        https://github.com/heroku/heroku-buildpack-multi
RAILS_ENV            production
SECRET_KEY_BASE      4fe509360dd89d746b23f2239435218b049bb65aaac5a2301c0d0a2e0bef7ace05b3105fb8f7fe9aa5fc12bc3a4bf7a0f516a8ac8ee279913970be5b6db6a628

```

## Deploy

Now we are ready to deploy using the fancy-shmancy Heroku buildpacks and pushing our code to the deis-builder component.

```console
$ git push deis master
Counting objects: 214, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (132/132), done.
Writing objects: 100% (214/214), 175.61 KiB | 175.61 MiB/s, done.
Total 214 (delta 65), reused 214 (delta 65)
remote: Resolving deltas: 100% (65/65), done.
Starting build... but first, coffee!
-----> Restoring cache...
       No cache file found. If this is the first deploy, it will be created now.
-----> Fetching custom buildpack
-----> Multipack app detected
       =====> Downloading Buildpack: https://github.com/heroku/heroku-buildpack-nodejs
       =====> Detected Framework: Node.js

-----> Creating runtime environment

       NPM_CONFIG_LOGLEVEL=error
       NODE_VERBOSE=false
       NODE_ENV=production
       NODE_MODULES_CACHE=true
...
...
(Skipping output of three buildpacks here)
...
...
       Using release configuration from last framework (Ruby).
-----> Discovering process types
       Procfile declares types -> web, release
       Default process types for Multipack -> rake, console, web, worker
-----> Checking for changes inside the cache directory...
       Files inside cache folder changed, uploading new cache...
       Done: Uploaded cache (44M)
-----> Compiled slug size is 96M
Build complete.
Launching App...
...
...
...
Done, rocksolidapp:v3 deployed to Workflow

Use 'deis open' to view this application in your browser

To learn more, use 'deis help' or visit https://deis.com/

To ssh://deis-builder.192.168.99.107.nip.io:2222/rocksolidapp.git
 * [new branch]      master -> master

```

## Post-Deploy (SQLite3 Migration)

So normally we would run our migrations in ephemeral pods using a CI tool or using the ephemeral pod spun up with `deis run` command like this:

```console
$ deis run rake db:migrate
$ deis run rake db:seed
```

However, since we are not connected to an external DB but instead we are using awesome sqlite3 in production, we need some way to run the migration and seed of all the pods' file system databases. So here are the two commands that will do that for each pod of this application (these commands should be ran whenever you scale up pods):

```console
$ kubectl get pods -n rocksolidapp | awk '{print $1}' | awk 'NR>1' | xargs -i sh -c 'kubectl exec {} -n rocksolidapp -- /bin/bash /runner/init rake db:migrate'

$ kubectl get pods -n rocksolidapp | awk '{print $1}' | awk 'NR>1' | xargs -i sh -c 'kubectl exec {} -n rocksolidapp -- /bin/bash /runner/init rake db:seed'
```

In future releases of Hephy Workflow we plan to have support for the `release` Procfile type. See Hephy Workflow [Issue #65](https://github.com/teamhephy/workflow/issues/65).

## Additional Resources

* [GitHub Project](https://github.com/teamhephy/workflow)
* [Documentation](https://deis.com/docs/workflow/)
* [Blog](https://deis.com/blog/)

[Hephy Workflow]: https://github.com/teamhephy/workflow#readme
[Disclaimer]: https://github.com/teamhephy/example-rails5-reactjs/blob/master/README.md#disclaimer

## Disclaimer

Hephy Workflow is in no way affiliated with or endorsed by Martin Fowler. It is endorsed by the :squirrel: emoji.

We do not mean to disrespect the Heroku stance on sqlite3 in production dynos. We just think its overkill that we have to hack the buildpacks in order to create a demo app with filesystem db ...
