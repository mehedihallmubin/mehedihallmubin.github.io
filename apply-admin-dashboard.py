#!/usr/bin/env python3
"""Splice the admin dashboard fragment (17. admin-dashboard.html) into all
6 page sources, replacing the old <div id="admin-modal">...</div> block
(up to <div id="toast">). Run, then run 00. build.py.

Checks: every required admin ID is present exactly once per page, and the
fragment itself has no duplicate IDs."""
import re
import sys
from collections import Counter

HERE = '/home/hatch/workspace/goals/personal-website/rebuild'
PAGES = ['01. index.html', '07. blog.html', '08. portfolio.html',
         '09. work.html', '11. contact.html', '12. reviews.html']
REQUIRED_IDS = [
    'admin-modal', 'admin-h', 'admin-close', 'admin-logout', 'admin-bell',
    'admin-tab-more', 'admin-more-menu',
    'ds-views', 'ds-visitors', 'ds-posts', 'ds-social', 'ds-brands', 'ds-reviews',
    'ds-range', 'ds-donut', 'ds-donut-center', 'ds-donut-legend',
    'ds-mc-posts', 'ds-mc-social', 'ds-mc-brands', 'ds-mc-reviews',
    'ds-mc-community', 'ds-mc-texts', 'ds-activity',
    'ds-ag-posts', 'ds-ag-brands', 'ds-ag-reviews', 'ds-ag-social',
    'ds-ag-community', 'ds-ag-texts',
    'admin-link', 'admin-widget', 'mr-name', 'mr-stars', 'mr-text', 'mr-add',
    'mr-list', 'admin-save', 'admin-saved',
    'social-save', 'social-saved', 'community-save', 'community-saved',
    'bp-title', 'bp-text', 'bp-add', 'bp-cancel', 'bp-list',
    'br-name', 'br-role', 'br-line', 'br-add', 'br-cancel', 'br-list',
    'tx-list', 'tx-save', 'tx-reset', 'tx-saved',
    'admin-clear-data', 'admin-cleared',
]
SOCIAL_IDS = ['sl-' + p for p in ['facebook', 'instagram', 'youtube', 'linkedin',
    'tiktok', 'pinterest', 'rumble', 'threads', 'x', 'telegram', 'vimeo',
    'snapchat', 'reddit', 'tumblr', 'discord', 'whatsapp', 'behance',
    'dribbble', 'adobe-stock', 'shutterstock', 'istock', 'alamy',
    'depositphotos', 'dreamstime', '123rf', 'freepik']]
COMMUNITY_IDS = ['cl-' + p for p in ['discord', 'whatsapp', 'telegram',
    'facebook', 'youtube', 'reddit', 'instagram', 'x', 'linkedin']]
REQUIRED_IDS += SOCIAL_IDS + COMMUNITY_IDS


def main():
    with open(HERE + '/17. admin-dashboard.html', encoding='utf-8') as f:
        frag = f.read().rstrip('\n') + '\n'
    # Fragment must not contain duplicate IDs (ignore the header comment).
    frag_no_comment = re.sub(r'<!--.*?-->', '', frag, flags=re.S)
    ids = re.findall(r'id="([^"]+)"', frag_no_comment)
    dups = [i for i, n in Counter(ids).items() if n > 1]
    if dups:
        print('FRAGMENT DUPLICATE IDS:', dups)
        return 1
    # Fragment must contain every required ID exactly once.
    missing = [i for i in REQUIRED_IDS if ids.count(i) != 1]
    if missing:
        print('FRAGMENT MISSING/EXTRA IDS:', [(i, ids.count(i)) for i in missing])
        return 1
    for name in PAGES:
        path = HERE + '/' + name
        with open(path, encoding='utf-8') as f:
            html = f.read()
        a = html.find('<div id="admin-modal"')
        b = html.find('<div id="toast"', a)
        if a < 0 or b < 0:
            print(name, ': modal/toast markers not found')
            return 1
        html = html[:a] + frag + html[b:]
        # Verify the whole page still has every required ID exactly once.
        page_ids = re.findall(r'id="([^"]+)"', html)
        bad = [(i, page_ids.count(i)) for i in REQUIRED_IDS if page_ids.count(i) != 1]
        if bad:
            print(name, ': ID check failed:', bad)
            return 1
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(name, ': dashboard spliced OK')
    print('All 6 pages updated. Now run: python3 00. build.py')
    return 0


if __name__ == '__main__':
    sys.exit(main())
