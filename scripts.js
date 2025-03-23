// ==UserScript==
// @name         AutoBackUp
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动备份
// @author       v9d0g
// @match        /add/
// @match        /add
// @icon         /add/static/img/main.ico
// @grant        none
// ==/UserScript==


const BaseURL='';
const IsAutoBackUp = true;
// 保存的文件后缀
const SaveSuffix ='.md';
// 保存的文件模板
const SaveTemplate = `
# {{time}}-{{title}}

## 漏洞信息：

| 信息     | 内容              |
| -------- | ----------------- |
| 漏洞分类 | {{category}}      |
| 漏洞分级 | {{level}}         |
| 开发商   | {{company}}       |
| 网段     | {{network}}       |
| Url      | {{url}}           |
| 用户名   | {{username}}      |
| 密码     | {{password}}      |

## 报告内容：

{{content}}

    `;

const CategoryMap = {
    6: "CSRF漏洞",
    1: "SQL注入漏洞",
    7: "SSRF漏洞",
    5: "XSS漏洞",
    3: "代码执行漏洞",
    15: "任意文件下载",
    14: "任意文件读取",
    13: "其他漏洞",
    4: "命令执行漏洞",
    9: "弱口令",
    10: "敏感信息泄露",
    2: "文件上传漏洞",
    16: "未授权访问",
    8: "点击劫持漏洞",
    18: "疑似被黑/存在后门",
    17: "逻辑缺陷"
};

class Utils{
    // 替换图片
    // TODO: 图片是否会删除? 7DAY后是否无法访问图片
    filteImg(text) {
        const regex = /!\[.*?\]\(\/media\/images\/.*?\)/g;
        const replacedText = text.replace(regex, (match) => {
            const originalPath = match.match(/\/media\/images\/.*?\)/)[0].replace(')', '');
            const newUrl = `${BaseURL}${originalPath}`;
            return `![null](${newUrl})`;
        });
        return replacedText;
    };

    // 下载
    downloadFile(url, fileName) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = "_blank"; //新窗口中下载文件
        link.click();
    };

    // 获取时间
    getDate() {
        const now = new Date();
        const year = now.getFullYear(); // 获取年份
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 获取月份，需要加1，因为月份是从0开始的
        const day = String(now.getDate()).padStart(2, '0'); // 获取日期
        return `${year}${month}${day}`;
    };


};
const utils = new Utils();

// 选择器
const Selectors = {
    title: '#id_title',
    category: '#id_category',
    level: '#id_level',
    company: '#select2-id_company-container',
    network: '#id_network',
    username: '#id_username',
    password: '#id_password',
    url: '#id_url',
    content: '#id_content',
    time: null,
};

// 卡片
class Card {
    constructor() {
        this.createCard();
    }

    // 创建卡片
    createCard() {
        // 动态插入样式
        const style = document.createElement('style');
        style.innerHTML = `
            .custom-card {
                position: fixed;
                top: 10vh;
                right: 10vh;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                z-index: 1000;
            }
            .custom-card label {
                display: block;
                margin-bottom: 5px;
            }
            .custom-card input[type="text"],
            .custom-card button {
                margin-bottom: 10px;
            }
            .custom-card button {
                padding: 5px 10px;
                cursor: pointer;
            }
            .button-container {
                display: flex;
                gap: 10px;
            }
        `;
        document.head.appendChild(style);

        const card = document.createElement('div');
        card.innerHTML = `
            <lable>及时备份</lable>
`;
        card.className = 'custom-card';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const isAutoBackUpButton = document.createElement('button');
        isAutoBackUpButton.disabled = true;
        this.updateIsAutoBackUpButtonClass(isAutoBackUpButton); // 根据 IsAutoBackUp 的值设置类名
        buttonContainer.appendChild(isAutoBackUpButton);

        /*
        //TODO: 获取所有可以的备份
        const getBackUpButton = document.createElement('button');
        getBackUpButton.textContent = '获取全部备份';
        getBackUpButton.className = 'am-btn am-btn-secondary am-topbar-btn am-btn-sm am-dropdown-toggle'; // 添加类名
        getBackUpButton.addEventListener('click', () => {
            alert('开始获取备份');
        });
        buttonContainer.appendChild(getBackUpButton);
        */

        card.appendChild(buttonContainer);


        // 将卡片添加到页面
        document.body.appendChild(card);
    }

    // 根据 IsAutoBackUp 的值更新 IsAutoBackUp 按钮的类名
    updateIsAutoBackUpButtonClass(button) {
        if (IsAutoBackUp) {
            button.className = 'am-btn am-btn-success am-topbar-btn am-btn-sm am-dropdown-toggle';
            button.textContent = '自动备份启动';
        } else {
            button.className = 'am-btn am-btn-danger am-topbar-btn am-btn-sm am-dropdown-toggle';
            button.textContent = '自动备份关闭';
        }
    }
};

// 保存
class Save {
    constructor(template, selectors) {
        this.template = template;
        this.selectors = selectors;
    }

    // 获取页面中的数据
    getData() {
        const data = {};
        for (const key in this.selectors) {
            const selector = this.selectors[key];
            const element = document.querySelector(selector);
            if (selector === '#select2-id_company-container') {
                // 获取开发商的文本内容并去除×字符
                data[key] = element ? element.textContent.trim().replace(/×/g, '') : '无';
            }else {
                data[key] = element ? element.value || element.textContent : '无';
                if(selector === '#id_category'){
                    // 漏洞类型
                    data[key]=CategoryMap[data[key]];
                };
                if(typeof contentEditor_id_content !== 'undefined' && selector === '#id_content'){
                    // 获取富文本内容
                    data[key] = contentEditor_id_content.getValue().trim()
                };
            };
        }
        // console.log(data);
        return data;
    }

    // 生成
    generateFile(data) {
        return this.template.replace(/{{(\w+)}}/g, (match, key) => data[key] || '');
    }

    // 保存
    saveFile() {
        const data = this.getData();

        data.time=utils.getDate();

        const content = utils.filteImg(this.generateFile(data));

        const blob = new Blob([content], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);

        utils.downloadFile(url,`${data.time}-${data.title}${SaveSuffix}`);
        URL.revokeObjectURL(url);
    }
};


(function () {
    "use strict";

    const card = new Card();

    // 提交
    if (IsAutoBackUp){
        const submitButton = document.getElementById("submit_button");

        submitButton.addEventListener("click", function () {
            const slidingTextElement = document.getElementById('aliyunCaptcha-sliding-text');

            // 滑块验证
            if (slidingTextElement && slidingTextElement.textContent === '滑动完成') {
                const saveInstance = new Save(SaveTemplate, Selectors);
                saveInstance.saveFile();
            } else {
                console.log('滑块验证失败');
            }
        });
    };

})();
