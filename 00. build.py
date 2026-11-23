#!/usr/bin/env python3
"""00. build.py - Build the single-file pages from the numbered files.

Reads the page files (01, 07-12), 02. styles.css, 03. reviews.js,
05. social.js, 06. header.js, 13. community.js, 14. brands.js,
15. blog.js and 16. texts.js from this folder and writes the assembled
single-file pages (CSS + JS inlined), which are what go live.

Usage:
    python3 00. build.py            (build all pages + stage copies)
    python3 00. build.py blog.html (build one page only, no staging)

Outputs (in this folder):
    Mehedi-H-All-Mubin-Personal-Website.html  (Home - the Drive main file)
    blog.html, portfolio.html, brands.html, services.html, contact.html, reviews.html

Staging (all-pages run only): Home is copied to ../files/ (the Drive main
file) and to ../github-pages/index.html; the other pages are copied to
../github-pages/<name>.html. Nothing is pushed to the repo here - that is
a separate, browser-only step after he confirms the preview.
"""
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
GOAL = os.path.dirname(HERE)
PAGES = {
    '01. index.html': 'Mehedi-H-All-Mubin-Personal-Website.html',
    '07. blog.html': 'blog.html',
    '08. portfolio.html': 'portfolio.html',
    '09. work.html': 'work.html',
    '11. contact.html': 'contact.html',
    '12. reviews.html': 'reviews.html',
}


def read(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


def build(src_name, out_name):
    html = read(src_name)
    css = read('02. styles.css')
    js = read('03. reviews.js')
    social_js = read('05. social.js')
    header_js = read('06. header.js')
    community_js = read('13. community.js')
    brands_js = read('14. brands.js')
    blog_js = read('15. blog.js')
    texts_js = read('16. texts.js')

    assert html.count('<link rel="stylesheet" href="02. styles.css">') == 1, \
        'stylesheet link not found exactly once in ' + src_name
    assert html.count('<script src="03. reviews.js"></script>') == 1, \
        'reviews script link not found exactly once in ' + src_name
    assert html.count('<script src="05. social.js"></script>') == 1, \
        'social script link not found exactly once in ' + src_name
    assert html.count('<script src="06. header.js"></script>') == 1, \
        'header script link not found exactly once in ' + src_name
    assert html.count('<script src="13. community.js"></script>') == 1, \
        'community script link not found exactly once in ' + src_name
    assert html.count('<script src="14. brands.js"></script>') == 1, \
        'brands script link not found exactly once in ' + src_name
    assert html.count('<script src="15. blog.js"></script>') == 1, \
        'blog script link not found exactly once in ' + src_name
    assert html.count('<script src="16. texts.js"></script>') == 1, \
        'texts script link not found exactly once in ' + src_name

    out = html.replace('<link rel="stylesheet" href="02. styles.css">',
                       '<style>' + css + '</style>')
    out = out.replace('<script src="03. reviews.js"></script>',
                      '<script>' + js + '</script>')
    out = out.replace('<script src="05. social.js"></script>',
                      '<script>' + social_js + '</script>')
    out = out.replace('<script src="06. header.js"></script>',
                      '<script>' + header_js + '</script>')
    out = out.replace('<script src="13. community.js"></script>',
                      '<script>' + community_js + '</script>')
    out = out.replace('<script src="14. brands.js"></script>',
                      '<script>' + brands_js + '</script>')
    out = out.replace('<script src="15. blog.js"></script>',
                      '<script>' + blog_js + '</script>')
    out = out.replace('<script src="16. texts.js"></script>',
                      '<script>' + texts_js + '</script>')

    target = os.path.join(HERE, out_name)
    with open(target, 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)
    print(f'built {out_name}: {len(out.encode())} bytes')
    return target


def stage():
    files_dir = os.path.join(GOAL, 'files')
    gh = os.path.join(GOAL, 'github-pages')
    os.makedirs(files_dir, exist_ok=True)
    os.makedirs(gh, exist_ok=True)
    home = os.path.join(HERE, PAGES['01. index.html'])
    shutil.copyfile(home, os.path.join(files_dir, 'Mehedi-H-All-Mubin-Personal-Website.html'))
    shutil.copyfile(home, os.path.join(gh, 'index.html'))
    for src, out in PAGES.items():
        if src == '01. index.html':
            continue
        shutil.copyfile(os.path.join(HERE, out), os.path.join(gh, out))
    print('staged: files/ (Home main) + github-pages/ (index + 5 pages)')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        want = sys.argv[1]
        match = None
        for src, out in PAGES.items():
            if want in (src, out):
                match = (src, out)
                break
        if not match:
            raise SystemExit('unknown page: ' + want)
        build(*match)
    else:
        for src, out in PAGES.items():
            build(src, out)
        stage()
