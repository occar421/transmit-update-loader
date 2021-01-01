# transmit-update-loader

[![CircleCI](https://circleci.com/gh/occar421/transmit-update-loader/tree/master.svg?style=svg)](https://circleci.com/gh/occar421/transmit-update-loader/tree/master)
[![Build status](https://ci.appveyor.com/api/projects/status/slqhhh1kuiatmtaf/branch/master?svg=true)](https://ci.appveyor.com/project/occar421/transmit-update-loader/branch/master)
[![npm version](https://badge.fury.io/js/transmit-update-loader.svg)](https://badge.fury.io/js/transmit-update-loader)

Message passing tool to transmit an update to another file during webpack loader process.

# Use case

Assume this file structure while using CSS Modules.

```
+- src/
    +- Button.tsx
    +- Button.css
    +- Button.css.d.ts
```

Here, also assume we use Webpack Hot Module Replacement for dev server.   
When 'Button.css' is updated, 'Button.css.d.ts' could be updated.  
Although, 'Button.tsx' will not be notified that 'Button.css.d.ts' is updated.  
If 'Button.css' selector has changed, 'Button.tsx' won't be decorated correctly.  

Fortunately, it seems that webpack detects update with watching the same event when it is `touch`-ed.

'Button.css' -(generate)-> 'Button.css.d.ts' -(watch)-(`touch`)-> 'Button.tsx' recompile.

# TODO

* Options
  * Throttle
  * [TBD] 
