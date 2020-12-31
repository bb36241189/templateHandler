/**
 * Created by Administrator on 2018/4/8 0008.
 * 使用此模板解析，需要先解析模板局部，然后再解析全部模板
 */
const Pubsub = require('../lib/Pubsub');
function TemplateHandler() {
  Pubsub.call(this);
}
TemplateHandler.prototype = Object.create(Pubsub.prototype);
Object.assign(TemplateHandler.prototype,{
  constructor : TemplateHandler,
  guid: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },
  replaceAll : function(strin, st, tst) {
    var test = new RegExp(st, 'g');
    return strin.replace(test, tst);
  },
  _analysisSFor : function ($ele,data) {
    var sFor = $ele.attr('s-for'),sForValue,i,$eClone,self = this;
    if(sFor){
      $ele.removeAttr('s-for');
      sForValue = this._iterValue(data,sFor);
      if(Object.prototype.toString.call(sForValue) === '[object Object]'){
        for(i in sForValue){
          $eClone = $ele.clone();
          $eClone.html(self.bindData2View($eClone.html(),sForValue[i]));
          // self._analysisDirective($eClone,data);
          // self._analysisDirective($eClone,);
          $eClone.insertBefore($ele);
        }
      }else if(Object.prototype.toString.call(sForValue) === '[object Array]'){
        for(i = 0;i<sForValue.length;i++){
          $eClone = $ele.clone();
          $eClone.html(self.bindData2View($eClone.html(),sForValue[i]));
          // self._analysisDirective($eClone,data);
          // self._analysisDirective($eClone,sForValue[i]);
          $eClone.insertBefore($ele);
        }
      }
      $ele.remove();
    }
  },
  _analysisSIf : function ($ele,data) {
    var sIf = $ele.attr('s-if');
    if(sIf){
      if(this._iterValue(data,sIf)){
        $ele.css({
          display : ''
        })
      }else{
        $ele.css({
          display : 'none'
        })
      }
      $ele.removeAttr('s-if');
    }
  },
  _analysisDataSrc : function ($ele,data) {
    var dataSrc = $ele.attr('data-src'),self = this,dsv,img;
    if(dataSrc){
      dsv = this._iterValue(data,dataSrc.substring(2,dataSrc.length-2));
      img = document.createElement('img');
      img.src = decodeURIComponent(dsv) || decodeURIComponent(dataSrc);
      img.onload = function (e) {
        self.trigger('imgLoaded',img,$ele.attr('ele-id'))
      };
      $ele.attr('src',decodeURIComponent(dsv) || decodeURIComponent(dataSrc));
      $ele.attr('ele-id',this.guid());
    }
  },
  _analysisSHide : function ($ele,data) {
    var sIf = $ele.attr('s-hide');
    if(sIf){
      if(this._iterValue(data,sIf)){
        $ele.css({
          display : 'none'
        })
      }else{
        $ele.css({
          display : ''
        })
      }
      $ele.removeAttr('s-hide');
    }
  },
  _analysisDirective : function ($ele,data) {
    var self = this;
    this._analysisSFor($ele,data);
    this._analysisSIf($ele,data);
    this._analysisSHide($ele,data);
    this._analysisDataSrc($ele,data);
    $ele.children().forEach(function (ele) {
      self._analysisDirective($(ele),data);
    });
    return $ele;
  },
  _analysis : function (tpl,data) {
    var $ele = $('<div></div>');
    $ele.html(tpl);
    this._analysisDirective($ele,data);
    return $ele.html();
  },
  /**
   * 从data里面获取值
   * @param data 对象
   * @param transfer 类似'user.name'
   * @private
   */
  _iterValue : function (data,transfer) {
    var pIndex = transfer.indexOf('.');
    if(pIndex>0){
      if(data[transfer.substring(0,pIndex)]){
        return this._iterValue(data[transfer.substring(0,pIndex)],transfer.substring(pIndex+1));
      }else{
        return undefined;
      }
    }else{
      return data[transfer];
    }
  },
  bindData2View : function (tpl,data) {
    var mat,j,cTransfer,cValue,self = this;
    tpl = self._analysis(tpl,data);
    mat = tpl.match(/\{\{(((?!}})[\s\S])*)\}\}/g);
    if(mat && mat.length){
      for(j = 0;j<mat.length;j++){
        cTransfer = mat[j].substring(2,mat[j].length-2);
        cValue = self._iterValue(data,cTransfer);
        tpl = self.replaceAll(tpl,mat[j],cValue);
      }
    }
    // tpl = self.replaceAll(tpl,'data-src','src');
    return tpl;
  }
});
module.exports = new TemplateHandler();
