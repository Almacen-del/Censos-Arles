import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fruitForecast} from '../lib/fruit-forecast.mjs';
const row=(inflorescencias,botones,extra={})=>({datos:{estado:'COMPLETO',sexo:'Hembra',muerto:false,inflorescencias,botones,...extra}});
test('forecast sums products per tree with 70 percent and rounds only for display',()=>{
 assert.equal(fruitForecast([row(10,20),row(5,4)]),154);
 assert.equal(Math.round(fruitForecast([row(1,1),row(1,1)])),1);
});
test('forecast excludes males, dead trees, drafts and incomplete captures',()=>{
 assert.equal(fruitForecast([row(10,20,{sexo:'Macho'}),row(null,null,{muerto:true}),row(10,20,{estado:'BORRADOR'}),row(10,null),row(0,null)]),0);
 assert.equal(fruitForecast([]),0);
});
