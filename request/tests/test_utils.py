import unittest
import json
import flask
from dipeck_request import utils


class Mock():

    def __init__(self):
        self.args = []
        self.kwargs = {}

    @utils.jsonify
    def return_map(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        return {'a': 'A', 'b': 2}

    @utils.jsonify
    def return_with_code(self, *args, **kwargs):
        return [1, 2, 3], 200


class TestUtils(unittest.TestCase):

    def _parse_response(self, response):
        response, code = response if isinstance(response, tuple) \
            else (response, 200)
        parsed = json.loads(response.data.decode())
        return parsed, code

    def test_jsonify(self):
        mock = Mock()
        app = flask.Flask(__name__)
        app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

        with app.test_request_context('/is-prime/?num=13'):
            map_res = self._parse_response(mock.return_map('z', p='q'))[0]
            res, code = self._parse_response(mock.return_with_code())

        self.assertEqual({'a': 'A', 'b': 2}, map_res)
        self.assertEqual([1, 2, 3], res)
        self.assertEqual(200, code)

        self.assertEqual(('z',), mock.args)
        self.assertEqual({'p': 'q'}, mock.kwargs)

    def test_parse_number(self):
        self.assertEqual((False, 1, 'No argument supplied'),
                         utils.parse_number(None))
        self.assertEqual((False, 2, 'Argument was not a number'),
                         utils.parse_number('a'))
        self.assertEqual((True, 13), utils.parse_number(13))
