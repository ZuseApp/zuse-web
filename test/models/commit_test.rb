require 'test_helper'

class CommitTest < ActiveSupport::TestCase
  def setup
    @user = FactoryGirl.create(:user)
    @project = FactoryGirl.create(:project, { user: @user })
  end

  test "needs update should return false" do
    commit = @project.commits.first

    assert !commit.needs_update?(@project.project_json, @project.compiled_code)
  end

  test "needs update should return true with different project_json" do
    commit = @project.commits.first

    assert commit.needs_update?("{}", @project.compiled_code)
  end

  test "needs update should return true with different compiled_code" do
    commit = @project.commits.first

    assert commit.needs_update?(@project.project_json, '{ "test" : "fail" }')
  end

end
