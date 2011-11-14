/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {

    require('gcli/index');
    require('rconsole/commands/basic').startup();
    require('rconsole/commands/eval').startup();

    var help = require('rconsole/commands/help');
    help.startup();
    help.helpMessages.prefix = "\
        <h2>Welcome to rconsole</h2>\
        <p><strong>rconsole</strong> é uma pequena ferramenta de depuração para desenvolvedores web, seu foco principal são desenvolvedores de aplicações para plataformas mobile ou smart tv's, em principal aquelas plataformas onde o processo de depuração remota não é oferecido pelo SDK original, ou mesmo para aqueles desenvolvedores que gostam de executar testes de comportamento diretamente na plataforma alvo.</p>\
        <p>Seu funcionamento é realmente simples, uma vez que este console esteja aberto, basta digitar <em>listen</em>, você vai obter um código para adicionar a sua página remota, adicione-o, recarregue a página remota e você deve esta pronto para depurar ou executar seus testes.</p>\
        \
        \
        <p>Useful links: \
        <a target='_blank' href='https://github.com/nuxlli/rconsole'>source</a>\
        |\
        <a target='_blank' href='https://jsconsole.com'>jsconsole (inspiration)</a>\
        |\
        <a target='_blank' href='https://github.com/mozilla/gcli'>gcli</a>\
        |\
        <a target='_blank' href='https://nodejs.org'>node.js</a>\
        |\
        <a target='_blank' href='http://nowjs.com'>now.js</a>\
    "
});
