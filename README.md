# GraphDesigner

Demo: https://graph-designer.herokuapp.com/

This is a School class Project. The class name is Computation Theory.

Before deploying to heroku, you should have:
1. Docker installed on your device
2. Install Heroku CLI
3. NET core installed on your device

Run following commands to deploy to heroku web:

- heroku container:login
- docker build -t graphdesigner .
- heroku container:push -a graph-designer web
- heroku container:release -a graph-designer web

