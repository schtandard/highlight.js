/*
Language: Test
Author: Benedikt Wilde <bwilde@posteo.de>
*/

import * as regex from '../lib/regex.js';

/** @type LanguageFn */
export default function(hljs) {
  // Chain some modes to be applied consecutively.
  // If modes == [A, [B, C], [D, E, F]], then an outer chain (i.e. any link may
  // be omitted) <A-B-D> will be created, which contains the inner chains (i.e.
  // only trailing links may be omitted) <B-C> and <D-E-F> as subchains.
  // If lookahead is true, the begin value of the first mode in the chain is
  // used as the begin lookahead of the outermost mode of the chain. If
  // lookahead is truthy but not true, it is assumed to be a regex and itself
  // used.
  // Since chaining is realized using the starts field, that field cannot be
  // used by the modes that shall be chained. (Except for the last mode in a
  // subchain, which may use it with care.)
  const MODE_CHAIN = function(modes, lookahead = true) {
    var skeleton = {};
    if (lookahead === true) {
      skeleton = {begin: regex.lookahead(GET_FIRST_BEGIN(modes[0]))};
    } else if (lookahead) {
      skeleton = {begin: regex.lookahead(lookahead)};
    }
    if (Array.isArray(modes)) {
      if (modes.length) {
        return hljs.inherit(
          {
            relevance: 0,
            contains: MODE_SUBCHAIN(modes[0]),
            starts: MODE_CHAIN(modes.slice(1), false)
          },
          skeleton
        );
      } else {
        return {relevance: 0};
      }
    } else {
      return modes;
    }
  }
  const MODE_SUBCHAIN = function(modes) {
    if (Array.isArray(modes)) {
      if (modes.length) {
        return [hljs.inherit(
          {starts: {
            endsParent: true,
            relevance: 0,
            contains: MODE_SUBCHAIN(modes.slice(1))
          }},
          modes[0]
        )];
      } else {
        return [];
      }
    } else {
      return MODE_SUBCHAIN([modes]);
    }
  };
  const GET_FIRST_BEGIN = function(modes) {
    if (Array.isArray(modes)) {
      return GET_FIRST_BEGIN(modes[0]);
    } else {
      return modes.begin;
    }
  };

  const A = {begin: /A/, className: 'A'};
  const B = {begin: /B/, className: 'B'};
  const C = {begin: /C/, className: 'C'};
  const D = {begin: /D/, className: 'D'};
  const E = {begin: /E/, className: 'E'};
  const F = {begin: /F/, className: 'F'};
  const EXAMPLE_CHAIN = MODE_CHAIN([A, [B, C], [D, E, F]]);

  const EXPLICIT_CHAIN = {
    begin: /(?=A)/,
    contains: [{
      begin: /A/, className: 'A',
      starts: {
        endsParent: true,
        contains: []
      }
    }],
    starts: {
      contains: [{
        begin: /B/, className: 'B',
        starts: {
          endsParent: true,
          contains: [{
            begin: /C/, className: 'C',
            starts: {
                endsParent: true,
                contains: []
              }
          }]
        }
      }],
      starts: {
        contains: [{
          begin: /D/, className: 'D',
          starts: {
            endsParent: true,
            contains: [{
              begin: /E/, className: 'E',
              starts: {
                endsParent: true,
                contains: [{
                  begin: /F/, className: 'F',
                  starts: {
                    endsParent: true,
                    contains: []
                  }
                }]
              }
            }]
          }
        }],
        starts: {}
      }
    }
  }

  const INVALID_CHAIN = {
    begin: /(?=A)/,
    contains: [{
      begin: /A/, className: 'A',
      starts: {
        // endsParent: true,
        contains: [{
          begin: /B/, className: 'B',
          starts: {
            endsParent: true,
            contains: [{
              begin: /C/, className: 'C',
              starts: {
                endsParent: true,
                contains: [{
                  begin: /D/, className: 'D',
                  starts: {
                    endsParent: true,
                    contains: []
                  }
                }]
              }
            }]
          }
        }],
        starts: {
          contains: [{begin: /x/, className: 'x', endsParent: true}],
          starts: {}
        }
      }
    }]
  }

  const NOENDPARENT_CHAIN = {
    begin: /(?=A)/,
    contains: [{
      begin: /A/, className: 'A',
      starts: {
        // endsParent: true,
        contains: [{
          begin: /B/, className: 'B',
          starts: {
            // endsParent: true,
            contains: [{
              begin: /C/, className: 'C',
              starts: {
                // endsParent: true,
                contains: [{
                  begin: /D/, className: 'D',
                  starts: {
                    // endsParent: true,
                    contains: []
                  }
                }]
              }
            }]
          }
        }]
      }
    }]
  }

  return {
    name: 'LaTeX',
    aliases: ['TeX'],
    contains: [
      // EXAMPLE_CHAIN,
      // EXPLICIT_CHAIN,
      // INVALID_CHAIN,
      NOENDPARENT_CHAIN
    ]
  };
}
