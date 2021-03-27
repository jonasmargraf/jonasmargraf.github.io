import json
import datetime

TDF = op.TDModules.mod.TDFunctions

class ShaderPresetExtension:
	"""
	ShaderPresetExtension description
	"""
	def __init__(self, ownerComp):
		# The component to which this extension is attached
		self.ownerComp = ownerComp
		file_path = self.ownerComp.par.Presetsjson.eval()
		self.presets = self.load_presets(file_path)

	def load_presets(self, file_path):
		debug(file_path)
		with open(file_path, "r") as file:
			data = json.loads(file.read())
			return data

	def SelectPreset(self, preset_index):
		# debug(preset_index)
		# debug(self.presets[preset_index])
		preset = self.presets[preset_index]
		for parameter, value in preset.items():
			param_base_name = parameter.capitalize()
			if isinstance(value, list):
				for index, val in enumerate(value):
					param_name = "".join((param_base_name, str(index + 1)))
					try:
						param = self.ownerComp.par[param_name]
						param.val = val
					except AttributeError as e:
						debug(f"{param_name} parameter doesn't exist.")
			else:
				try:
					param = self.ownerComp.par[param_base_name]
					# debug(param_base_name, param)
					param.val = value
				except AttributeError as e:
					debug(f"{param_base_name} parameter doesn't exist.")

			# debug(parameter.capitalize())
			# debug(len(value))
			# param = self.ownerComp.par[param_name]
			# debug(param)

	def OnPresetsFileChanged(self):
		file_path = self.ownerComp.par.Presetsjson.eval()
		self.presets = self.load_presets(file_path)

	def OnLoad(self):
		file_path = self.ownerComp.par.Presetsjson.eval()
		self.presets = self.load_presets(file_path)
		debug(self.presets)