define(['./__Assets/KB','./__BindNode'],function(CreateKB,CreateBindNode){
  function CreateKB_Bind()
  {
    /* BUILD SECTION */
      /* END BUILD SECTION */

    var _textBinds = []
      , _attrBinds = []
      , _pipedAttribute = {}
      , _startBind = "{{"
      , _endBind = "}}"
      , _onChangeEvents = {}
      , _KBListener = CreateKB()
      , _textListeners = ['innerHTML','textContent','innerText','outerHTML','outerText','appendChild','removeChild']
      , _onUpdate = function(e)
        {
          KB_Bind.updateUnsynced();
          KB_Bind();
          if(_textListeners.indexOf(e.attr) > -1)
          {
            _textBinds.forEach(function(k,i){
              k.compareCheck(e);
            });
          }
          else
          {
            _attrBinds.forEach(function(k,i){
              k.compareCheck(e);
            });
          }
        }

    function KB_Bind()
    {
      var textNodes = KB_Bind.SearchAllTextNodes(_startBind)
        , attrNodes = KB_Bind.SearchAllAttributes(_endBind)

      textNodes.forEach(function(k,i){
        _textBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind)
        .pipedAttributes(_pipedAttribute));
        _textBinds[_textBinds.length-1](k);
      });

      attrNodes.forEach(function(k,i){
        _attrBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind)
        .isAttr(true));
        _attrBinds[_attrBinds.length-1](k);
      });

      _textListeners.forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
      });

      KB_Bind.getAllAttributeTypes().forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
        k.pipedAttributes(_pipedAttribute);
      });

      _textBinds.forEach(function(k,i){
         k.pipedAttributes(_pipedAttribute);
      });

      _attrBinds.forEach(function(k,i){
         k.pipedAttributes(_pipedAttribute);
      });
    }

    KB_Bind.textBinds = function()
    {
      return _textBinds;
    }

    KB_Bind.attributeBinds = function()
    {
      return _attrBinds;
    }

    KB_Bind.pipedAttributes = function()
    {
      return _pipedAttribute;
    }

    KB_Bind.addPipedAttribute = function(n,f)
    {
      if(typeof n === 'string' && typeof f === 'function')
      {
        _pipedAttribute[n] = f;
      }
    }

    KB_Bind.removePipedAttribute = function(n)
    {
      if(_pipedAttribute[n] !== undefined)
      {
        _pipedAttribute[n] = undefined;
      }
    }

    //Search all text nodes for the designated search text and return list of text nodes
    KB_Bind.SearchAllTextNodes = function(searchText)
    {
      var lookingInBody = false
        , all = document.all
        , childs = []
        , _arr = []
        , n = {}
        , i
        , x;
      for(x=0;x<all.length;x++)
      {
        if(all[x].nodeName === 'BODY') lookingInBody = true;
        if(lookingInBody)
        {
          childs = document.all[x].childNodes;
          for(i=0;i<childs.length;i++)
          {
            if(childs[i].nodeName === '#text' && childs[i].textContent.indexOf(searchText) > -1)
            {
              n = {parentNode:all[x],text:childs[i]};
              _arr.push(n);
            }
          }
        }
      }
      return _arr;
    }

    //Search all node attributes for the designated search text and return list of attribute objects
    KB_Bind.SearchAllAttributes = function(searchText)
    {
      var lookingInBody = false
      , _arr = []
      , attrs = []
      , all = document.all
      , n = {}
      , i
      , x;

      for(x=0;x<all.length;x++)
      {
        if(all[x].nodeName === 'BODY') lookingInBody = true;
        if(lookingInBody)
        {
          attrs = all[x].attributes;
          for(i=0;i<attrs.length;i++)
          {
            if(attrs[i].value.indexOf(searchText) > -1)
            {
              n = {parentNode:all[x],attr:attrs[i]};
              _arr.push(n);
            }
          }
        }
      }
      return _arr;
    }

    //returns an array of all bind objects with the bind name of the id passed
    KB_Bind.getBindsById = function(id)
    {
      var _arr = []
        , x
        , i
        , localBinds = []

      for(x=0;x<_textBinds.length;x++)
      {
        localBinds = _textBinds[x].getBindById(id);
        if(localBinds.length > 0)
        {
          for(i=0;i<localBinds.length;i++)
          {
            _arr.push(localBinds[i]);
          }
        }
      }

      for(x=0;x<_attrBinds.length;x++)
      {
        localBinds = _attrBinds[x].getBindById(id);
        if(localBinds.length > 0)
        {
          for(i=0;i<localBinds.length;i++)
          {
            _arr.push(localBinds[i]);
          }
        }
      }

      return _arr;
    }

    //updates all binds associated with the bind name of the passed id with the new value
    KB_Bind.updateBindsById = function(id,value)
    {
      var binds = KB_Bind.getBindsById(id)
        , x;
      for(x=0;x<binds.length;x++)
      {
        binds[x].value(value).call();
      }
      return KB_Bind;
    }

    //checks if any binds elements have been removed from the DOM
    KB_Bind.updateUnsynced = function()
    {
      var x;
      for(x=0;x<_textBinds.length;x++)
      {
        if(_textBinds[x].node().parentElement === null)
        {
          _textBinds.splice(x,1);
        }
      }

      for(x=0;x<_attrBinds.length;x++)
      {
        if(_attrBinds[x].node().parentElement === null)
        {
          _attrBinds.splice(x,1);
        }
      }

      return KB_Bind;
    }

    //gets all attribute type for the watch to listen for the events of those changes
    KB_Bind.getAllAttributeTypes = function()
    {
      return Array.prototype.concat.apply([],_attrBinds.map(function(k,i){
        return Array.prototype.slice.call(k.node().attributes);
      })).filter(function(k,i,self){
        return (self.indexOf(k) === i)
      });
    }

    return KB_Bind;
  }
  if (typeof define === "function" && define.amd)
  {
    define('KB_Bind',CreateKB_Bind); //global KM define in browser
    define([],CreateKB_Bind); //define if file refrenced
  }
  else if (typeof module === "object" && module.exports)
  {
    module.exports = CreateKB_Bind;
  }
  return CreateKB_Bind;
});
