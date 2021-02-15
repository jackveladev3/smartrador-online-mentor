# smartrador-online-mentor

> Smartrador-online-mentor project

## Build Setup

``` bash
# install dependencies
yarn install
```

## Local Server Start
``` bash
# serve with hot reload at localhost:4100
yarn serve
```

## Deployment Build
デプロイ時に`smartrador-online-backend`の`./serverless.yml`の`MentorsLoginPatch.environment.VERSION`を更新する

### Dev
``` bash
# build for development with minification
yarn build

# upload to AWS S3
aws s3 rm s3://dev.me.smartrador.com/ --recursive
aws s3 cp ./dist s3://dev.me.smartrador.com/ --recursive --acl public-read
```

### Test
``` bash
# build for development with minification
yarn build:test

# upload to AWS S3
aws s3 rm s3://tst.me.smartrador.com/ --recursive
aws s3 cp ./dist s3://tst.me.smartrador.com/ --recursive --acl public-read
```


### Prod
``` bash
# build for production with minification
yarn build:prod

# upload to AWS S3
aws s3 rm s3://me.smartrador.com/ --recursive
aws s3 cp ./dist s3://me.smartrador.com/ --recursive --acl public-read
```
