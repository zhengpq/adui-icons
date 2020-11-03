adui-icon
===========

用于存放adui系列icon的数据包，根据不同项目的需求将原始的svg文件转成了不同的数据格式，这个包包含了adui、adui-wxapp 和 adui-ppt 的icon的数据。

# 安装

```bash
$ npm install adui-icon --save
```

# 使用方式

```js
import icons from 'adui-icon'

// path 对应的 interface
import { IIconNames } from 'adui-icon/lib/data/path/adui-icon-names'

// path 的数据包
import { pathData } from 'adui-icon/lib/data/path/path-data'

// data URI 的数据包
const dataURIData = icons.dataURIData

// svg 的数据包
const svgData = icons.svgData

//  icon 类型的数据，这里按照icon的类型对icon做了归类
const iconType = icons.typeData

```