/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const noOptionalChaining = require('./no-optional-chaining');
const spaceBetweenCnEn = require('./space-between-cn-en');
const namingConvention = require('./naming-convention');

module.exports = {
  'no-optional-chaining': noOptionalChaining,
  'space-between-cn-en': spaceBetweenCnEn,
  'naming-convention': namingConvention
};
