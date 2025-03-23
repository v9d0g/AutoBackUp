# 简介

一个用于提交报告时顺带下载备份的油猴脚本，直接添加进浏览器的油猴拓展中即可使用。

------

# 用法

确保你的浏览器正确安装了Tampermonkey拓展

![](S:\Cyber Security\2022\tools\AutoBackUp\images\83f5d1cc-0a27-4e82-89be-801662d8813d.png)

除此之外你需要打开该脚本，手动添加**3处**URL

![](S:\Cyber Security\2022\tools\AutoBackUp\images\ef81f2c0-5aba-4433-a84f-c78ac8d51c7a.png)

------

## 例如

```js
// @match        https://xxx.com/add/
// @match        https://xxx.com/add
// @icon         https://xxx.com/static/img/main.ico //图标 可选
// @grant        none
// ==/UserScript==


const BaseURL='https://xxx.com';
```

一切正常后，你界面的右侧会出现一个小卡片

![](S:\Cyber Security\2022\tools\AutoBackUp\images\e93db392-e06e-450a-9fe3-cb8cc728c909.png)

关闭脚本或者

```js
const IsAutoBackUp = false;
```

均可停止功能

------

# 效果

在通过滑块验证，点击**提交**后将下载本次提交的内容

文件名类似于`YYYYMMDD-TITLE.md`

------

## 模板

提供模板自定义后缀和样式

![](S:\Cyber Security\2022\tools\AutoBackUp\images\4894c8f9-9ad0-45ff-90ba-40f6d7685e18.png)



默认模板效果↓

------


# 20250323-Ciallo～(∠・ω< )⌒★

## 漏洞信息：

| 信息     | 内容              |
| -------- | ----------------- |
| 漏洞分类 | 代码执行漏洞      |
| 漏洞分级 | high         |
| 开发商   | caillo |
| 网段     | internet       |
| Url      | http://caillo.cn           |
| 用户名   | caillo      |
| 密码     | caillo      |

## 报告内容：

Ciallo～(∠・ω< )⌒★



# Tips

本代码仅供学习和研究目的使用，不用于任何可能违反法律法规或侵犯他人权益的用途。

