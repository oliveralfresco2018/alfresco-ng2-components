/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = require('../../../../util/util');

var ChecklistDialog = function () {

    var nameField = element(by.css("input[data-automation-id='checklist-name']"));
    var addChecklistButton = element(by.css("button[id='add-check'] span"));
    var closeButton = element(by.css("button[id='close-check-dialog'] span"));
    var dialogTitle = element(by.id("add-checklist-title"));

    this.addName = function (name) {
        Util.waitUntilElementIsVisible(nameField);
        nameField.sendKeys(name);
        return this;
    };

    this.clickCreateChecklistButton = function () {
        Util.waitUntilElementIsVisible(addChecklistButton);
        addChecklistButton.click();
    };

    this.clickCancelButton = function () {
        Util.waitUntilElementIsVisible(closeButton);
        closeButton.click();
    };

    this.getDialogTitle = function () {
        Util.waitUntilElementIsVisible(dialogTitle);
        return dialogTitle.getText();
    };

    this.getNameFieldPlaceholder = function () {
        Util.waitUntilElementIsVisible(nameField);
        return nameField.getAttribute('placeholder');
    };

    this.checkCancelButtonIsEnabled = function () {
        Util.waitUntilElementIsVisible(closeButton);
        Util.waitUntilElementIsClickable(closeButton);
        return this;
    };

    this.checkAddChecklistButtonIsEnabled = function () {
        Util.waitUntilElementIsVisible(addChecklistButton);
        Util.waitUntilElementIsClickable(addChecklistButton);
        return this;
    };

};
module.exports = ChecklistDialog;
