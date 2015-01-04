# coding: utf-8

import os
import sys
import json
import sublime
import platform
import sublime_plugin
from subprocess import Popen, PIPE

COMMAND_NAME = 'css_order'
SETTINGS_NAME = 'cssorder'
CONFIG_NAME_COMB = 'comb_config'
CONFIG_NAME_ORDER = 'order_config'
CONFIG_NAME_ISSAVE = 'format_on_save'
SETTINGS_PATH = 'cssorder.sublime-settings'
KEYMAP_FILE = "Default ($PLATFORM).sublime-keymap"
PLUGIN_FOLDER = os.path.dirname(os.path.realpath(__file__))

is_py2k = sys.version_info < (3, 0)
libs_path = os.path.join(PLUGIN_FOLDER, "libs")
order_path = os.path.join(sublime.packages_path(), PLUGIN_FOLDER, 'cssorder.js')

# common utils
class PluginUtils:
    # Python 2.x on Windows can't properly import from non-ASCII paths, so
    # this code added the DOC 8.3 version of the lib folder to the path in
    # case the user's username includes non-ASCII characters
    @staticmethod
    def add_lib_path(lib_path):
      def _get_short_path(path):
        path = os.path.normpath(path)
        if is_py2k and os.name == 'nt' and isinstance(path, unicode):
          try:
            import locale
            path = path.encode(locale.getpreferredencoding())
          except:
            from ctypes import windll, create_unicode_buffer
            buf = create_unicode_buffer(512)
            if windll.kernel32.GetShortPathNameW(path, buf, len(buf)):
              path = buf.value
        return path
      lib_path = _get_short_path(lib_path)
      if lib_path not in sys.path:
        sys.path.append(lib_path)

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

# crazyness to get jsbeautifier.unpackers to actually import
# with sublime's weird hackery of the path and module loading
PluginUtils.add_lib_path(libs_path)

# get merge for diff
import merge_utils

# monkeypatch `Region` to be iterable
sublime.Region.totuple = lambda self: (self.a, self.b)
sublime.Region.__iter__ = lambda self: self.totuple().__iter__()

class CssOrderCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        syntax = self.get_syntax()
        if not syntax:
            return

        combConfig = self.get_config(CONFIG_NAME_COMB)
        orderConfig = self.get_config(CONFIG_NAME_ORDER)

        if not self.has_selection():
            region = sublime.Region(0, self.view.size())
            originalBuffer = self.view.substr(region)
            destFile = self.comb(originalBuffer, syntax, combConfig, orderConfig)
            if destFile:
                self.replace_whole_css(edit, destFile)
            return

        # if user select some block
        for region in self.view.sel():
            if region.empty():
                continue

            originalBuffer = self.view.substr(region)
            destFile = self.comb(originalBuffer, syntax, combConfig, orderConfig)
            if destFile:
                self.view.replace(edit, region, destFile)

    def replace_whole_css(self, edit, destFile):
        view = self.view
        wholeRegion = sublime.Region(0, view.size())
        code = view.substr(wholeRegion)

        # Avoid replace file will go back to top
        _, err = merge_utils.merge_code(view, edit, code, destFile)
        if err:
            sublime.error_message("CSSOrder: Merge failure: '%s'" % err)

    def comb(self, css, syntax, combConfig, orderConfig):
        combConfig = json.dumps(combConfig)
        orderConfig = json.dumps(orderConfig)
        try:
            p = Popen(['node', order_path] + [syntax, combConfig, orderConfig],
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

    def get_config(self, configName):
        settings = self.get_settings()
        config = settings.get(configName)
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
        return self.view.file_name().endswith('.scss') or self.view.file_name().endswith('.sass')

    def is_less(self):
        return self.view.file_name().endswith('.less')

class CssOrderEventListeners(sublime_plugin.EventListener):
    @staticmethod
    def on_pre_save(view):
        if PluginUtils.get_settings(CONFIG_NAME_ISSAVE):
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

