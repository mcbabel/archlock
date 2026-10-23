__module__ = "internal.fs"
__paths__ = ["internal/fs/*.go"]
__depends_on__ = []

class FileSystem(http.FileSystem):
    def Open(self, name: string) -> '(fs.File, error)': ...
