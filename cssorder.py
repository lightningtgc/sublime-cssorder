# coding: utf-8

import os
import json
import platform
import sublime
import sublime_plugin
from subprocess import Popen, PIPE

PLUGIN_FOLDER = os.path.dirname(os.path.realpath(__file__))
KEYMAP_FILE = "Default ($PLATFORM).sublime-keymap"
SETTINGS_PATH = 'cssorder.sublime-settings'
CONFIG_ISSAVE_NAME = 'format_on_save'
CONFIG_RULES_NAME = 'config'
SETTINGS_NAME = 'cssorder'
COMMAND_NAME = 'css_order'

# monkeypatch `Region` to be iterable
sublime.Region.totuple = lambda self: (self.a, self.b)
sublime.Region.__iter__ = lambda self: self.totuple().__iter__()

COMB_PATH = os.path.join(sublime.packages_path(), os.path.dirname(os.path.realpath(__file__)), 'cssorder.js')
  
class CssOrderCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        syntax = self.get_syntax()
        if not syntax:
            return

        config = self.get_config()

        if not self.has_selection():
            region = sublime.Region(0, self.view.size())
            originalBuffer = self.view.substr(region)
            combed = self.comb(originalBuffer, syntax, config)
            if combed:
                self.view.replace(edit, region, combed)
            return
        for region in self.view.sel():
            if region.empty():
                continue
            originalBuffer = self.view.substr(region)
            combed = self.comb(originalBuffer, syntax, config)
            if combed:
                self.view.replace(edit, region, combed)

    def comb(self, css, syntax, config):
        config = json.dumps(config)
        try:
            p = Popen(['node', COMB_PATH] + [syntax, config],
                stdout=PIPE, stdin=PIPE, stderr=PIPE,
                env=self.get_env(), shell=self.is_windows())
        except OSError:
            sublime.error_message("CSSOrder: Couldn't find Node.js. Please make sure you have install it.")
            raise Exception("Couldn't find Node.js. Make sure it's in your " +
                            '$PATH by running `node -v` in your command-line.')
        stdout, stderr = p.communicate(input=css.encode('utf-8'))
        if stdout:
            return stdout.decode('utf-8')
        else:
            sublime.error_message('cssOrder error:\n%s' % stderr.decode('utf-8'))

    def get_env(self):
        env = None
        if self.is_osx():
            env = os.environ.copy()
            env['PATH'] += ':/usr/local/bin'
        return env

    def get_settings(self):
        settings = self.view.settings().get(SETTINGS_NAME)
        if settings is None:
            settings = sublime.load_settings(SETTINGS_PATH)
        return settings

    def get_config(self):
        settings = self.get_settings()
        config = settings.get(CONFIG_RULES_NAME)
        return config

    def get_syntax(self):
        if self.is_css():
            return 'css'
        if self.is_scss():
            return 'scss'
        if self.is_less():
            return 'less'
        if self.is_unsaved_buffer_without_syntax():
            return False
        return False

    def has_selection(self):
        for sel in self.view.sel():
            start, end = sel
            if start != end:
                return True
        return False

    def is_osx(self):
        return platform.system() == 'Darwin'

    def is_windows(self):
        return platform.system() == 'Windows'

    def is_unsaved_buffer_without_syntax(self):
        return self.view.file_name() == None and self.is_plaintext() == True

    def is_plaintext(self):
        return self.view.scope_name(0).startswith('text.plain')

    def is_css(self):
        return self.view.scope_name(0).startswith('source.css')

    def is_scss(self):

        # fix scope_name can't distinguish file type 
        return self.view.file_name().endswith('.scss')

    def is_less(self):
        return self.view.file_name().endswith('.less')

class CssOrderEventListeners(sublime_plugin.EventListener):
    @staticmethod
    def on_pre_save(view):
        if PluginUtils.get_settings(CONFIG_ISSAVE_NAME):
            view.run_command(COMMAND_NAME) 

class CssOrderSetCssorderConfigCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_sublime_settings(self.view.window())

class CssOrderSetKeyboardShortcutsCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_sublime_keymap(self.view.window(), {
      "windows": "Windows",
      "linux": "Linux",
      "osx": "OSX"
    }.get(sublime.platform()))

class PluginUtils:
    @staticmethod
    def get_settings(key):
        settings = sublime.load_settings(SETTINGS_PATH).get(key)
        return settings
    @staticmethod
    def open_sublime_settings(window):
        window.open_file( os.path.join(PLUGIN_FOLDER, SETTINGS_PATH) )

    @staticmethod
    def open_sublime_keymap(window, platform):
        window.open_file( os.path.join( PLUGIN_FOLDER, KEYMAP_FILE.replace("$PLATFORM", platform) ) )

